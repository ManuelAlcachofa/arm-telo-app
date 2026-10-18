// Lógica de compra: totales, creación de órdenes y simulación de pago.
import { actualizar, crear, obtener } from '../data/db.js';
import { precioFinal, stockNumerico } from '../utils/productos.js';

export const OPCIONES_ENTREGA = [
  { id: 'despacho', etiqueta: 'Despacho a domicilio', costo: 3990 },
  { id: 'retiro', etiqueta: 'Retiro en tienda (gratis)', costo: 0 },
];

export const RESULTADOS_PAGO = [
  { id: 'aprobado', etiqueta: 'Pago aprobado' },
  { id: 'rechazado', etiqueta: 'Pago rechazado' },
];

/** Código visible de una orden, por ejemplo ORDER00012. */
export function codigoOrden(orden) {
  return `ORDER${String(orden.id).padStart(5, '0')}`;
}

export function costoEntrega(entregaId) {
  return OPCIONES_ENTREGA.find((o) => o.id === entregaId)?.costo ?? 0;
}

/** items: [{ producto, cantidad }] */
export function calcularTotales(items, entregaId = 'retiro') {
  const subtotal = items.reduce((suma, i) => suma + precioFinal(i.producto) * i.cantidad, 0);
  const envio = items.length > 0 ? costoEntrega(entregaId) : 0;
  return { subtotal, envio, total: subtotal + envio };
}

/** Devuelve los nombres de los productos que superan el stock disponible. */
export function productosSinStock(items) {
  return items.filter((i) => i.cantidad > stockNumerico(i.producto)).map((i) => i.producto.nombre);
}

/** Crea una orden en estado "pendiente" guardando una copia de los productos y precios del momento. */
export function crearOrden({ cliente, direccion, entregaId, items, usuarioId = null }) {
  const { subtotal, envio, total } = calcularTotales(items, entregaId);
  const orden = crear('ordenes', {
    numero: '',
    usuarioId,
    cliente,
    direccion,
    entregaId,
    items: items.map(({ producto, cantidad }) => ({
      productoId: producto.id,
      categoriaId: producto.categoriaId,
      nombre: producto.nombre,
      precio: precioFinal(producto),
      cantidad,
      subtotal: precioFinal(producto) * cantidad,
    })),
    subtotal,
    envio,
    total,
    estado: 'pendiente',
    fecha: new Date().toISOString(),
  });
  const hoy = new Date();
  const dia = `${hoy.getFullYear()}${String(hoy.getMonth() + 1).padStart(2, '0')}${String(hoy.getDate()).padStart(2, '0')}`;
  return actualizar('ordenes', orden.id, { numero: `${dia}${String(orden.id).padStart(2, '0')}` });
}

/**
 * Simula el cobro. No existe una pasarela real: el resultado lo decide el cliente en el checkout
 * (aprobado / rechazado). Se deja como función aparte para poder reemplazarla (o simularla en las pruebas).
 */
export function procesarPago(orden, resultado = 'aprobado', demoraMs = 700) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        resultado === 'aprobado'
          ? { ok: true, codigo: codigoOrden(orden) }
          : { ok: false, motivo: 'El banco rechazó la transacción.' },
      );
    }, demoraMs);
  });
}

/** Marca la orden como pagada y descuenta el stock de cada producto con stock definido. */
export function confirmarPago(ordenId) {
  const orden = obtener('ordenes', ordenId);
  if (!orden) return null;
  orden.items.forEach((item) => {
    const producto = obtener('productos', item.productoId);
    if (producto && !(producto.stock === '' || producto.stock == null)) {
      actualizar('productos', producto.id, { stock: Math.max(0, stockNumerico(producto) - item.cantidad) });
    }
  });
  return actualizar('ordenes', ordenId, { estado: 'pagada', fechaPago: new Date().toISOString() });
}

export function rechazarPago(ordenId, motivo = '') {
  return actualizar('ordenes', ordenId, { estado: 'rechazada', motivo });
}

/** Cobra una orden (nueva o en reintento) y actualiza su estado. */
export async function pagarOrden(ordenId, resultado = 'aprobado', demoraMs) {
  const orden = obtener('ordenes', ordenId);
  if (!orden) return { ok: false, motivo: 'La orden no existe.' };
  const respuesta = await procesarPago(orden, resultado, demoraMs);
  if (respuesta.ok) confirmarPago(ordenId);
  else rechazarPago(ordenId, respuesta.motivo);
  return respuesta;
}
