// Lógica de compra: totales (para mostrar en pantalla), creacion de ordenes y pago simulado.
// La orden y el pago los procesa orden-service en el backend, que vuelve a calcular precios,
// valida el stock y lo descuenta en catalogo-service cuando el pago se aprueba.
import { desdeApi } from '../data/adaptadores.js';
import { cargar, guardarEnCache, recordarOrdenInvitado } from '../data/db.js';
import { precioFinal, stockNumerico } from '../utils/productos.js';
import { api, leerSesion, mensajeDeError } from './api.js';

export const OPCIONES_ENTREGA = [
  { id: 'despacho', etiqueta: 'Despacho a domicilio', costo: 3990 },
  { id: 'retiro', etiqueta: 'Retiro en tienda (gratis)', costo: 0 },
];

export const RESULTADOS_PAGO = [
  { id: 'aprobado', etiqueta: 'Pago aprobado' },
  { id: 'rechazado', etiqueta: 'Pago rechazado' },
];

/** Código visible de una orden */
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

/** Devuelve los nombres de los productos que superan el stock disponible */
export function productosSinStock(items) {
  return items.filter((i) => i.cantidad > stockNumerico(i.producto)).map((i) => i.producto.nombre);
}

/**
 * Crea la orden en orden-service (queda "pendiente").
 * Solo se envían ids y cantidades: el backend copia nombres y precios del catálogo.
 * Si la compra se hace con sesión iniciada, el backend la asocia al usuario por su token.
 * Lanza un error si el backend la rechaza (por ejemplo, por falta de stock).
 */
export async function crearOrden({ cliente, direccion, entregaId, items }) {
  const { data } = await api.post('/ordenes', {
    cliente,
    direccion: entregaId === 'despacho' ? direccion : null,
    entrega: entregaId,
    items: items.map(({ producto, cantidad }) => ({ productoId: producto.id, cantidad })),
  });
  const orden = desdeApi.ordenes(data);
  if (!leerSesion()) recordarOrdenInvitado(orden);
  return guardarEnCache('ordenes', orden);
}

/** Espera simulada*/
function esperar(demoraMs) {
  return new Promise((resolve) => {
    setTimeout(resolve, demoraMs);
  });
}

/**
 * Cobra una orden (nueva o en reintento). No hay pasarela real: el resultado lo decide
 * la persona en el checkout (aprobado / rechazado) y lo procesa el backend
 * Devuelve { ok: true, codigo } o { ok: false, motivo }
 */
export async function pagarOrden(ordenId, resultado = 'aprobado', demoraMs = 700) {
  await esperar(demoraMs);
  try {
    const { data } = await api.post(`/ordenes/${ordenId}/pago`, { resultado });
    if (data.orden) guardarEnCache('ordenes', desdeApi.ordenes(data.orden));
    if (data.ok) cargar('productos', { forzar: true }); // el stock cambió en el catálogo
    return data.ok ? { ok: true, codigo: data.codigo } : { ok: false, motivo: data.motivo };
  } catch (error) {
    return { ok: false, motivo: mensajeDeError(error, 'No se pudo procesar el pago.') };
  }
}
