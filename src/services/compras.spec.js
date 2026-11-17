import { obtener } from '../data/db.js';
import { crearProducto, limpiarTodo } from '../test/ayudas.jsx';
import { productoEnServidor } from '../test/servidorFalso.js';
import { calcularTotales, codigoOrden, crearOrden, pagarOrden, productosSinStock } from './compras.js';

describe('services/compras', () => {
  const cliente = { nombre: 'Pedro', apellidos: 'Soto', correo: 'pedro@correo.cl' };

  beforeEach(limpiarTodo);

  it('suma el costo de despacho solo cuando corresponde', () => {
    const items = [{ producto: { precio: 10000, precioOferta: '' }, cantidad: 2 }];
    expect(calcularTotales(items, 'retiro')).toEqual({ subtotal: 20000, envio: 0, total: 20000 });
    expect(calcularTotales(items, 'despacho')).toEqual({ subtotal: 20000, envio: 3990, total: 23990 });
    expect(calcularTotales([], 'despacho').envio).toBe(0);
  });

  it('detecta los productos que superan el stock disponible', () => {
    const items = [
      { producto: { nombre: 'A', stock: 1 }, cantidad: 2 },
      { producto: { nombre: 'B', stock: 5 }, cantidad: 2 },
    ];
    expect(productosSinStock(items)).toEqual(['A']);
  });

  it('crea una orden pendiente con copia de los precios y número de boleta', async () => {
    const producto = crearProducto({ precio: 50000, precioOferta: 40000 });
    const orden = await crearOrden({ cliente, direccion: {}, entregaId: 'retiro', items: [{ producto, cantidad: 2 }] });
    expect(orden.estado).toBe('pendiente');
    expect(orden.entregaId).toBe('retiro');
    expect(orden.total).toBe(80000);
    expect(orden.items[0].precio).toBe(40000);
    expect(orden.numero).toMatch(/^\d{8}\d{2}$/);
    expect(codigoOrden(orden)).toBe('ORDER00001');
  });

  it('el backend rechaza la orden si no hay stock suficiente', async () => {
    const producto = crearProducto({ stock: 1 });
    let error = null;
    try {
      await crearOrden({ cliente, direccion: {}, entregaId: 'retiro', items: [{ producto, cantidad: 3 }] });
    } catch (e) {
      error = e;
    }
    expect(error.response.status).toBe(409);
  });

  it('un pago aprobado marca la orden como pagada y descuenta el stock', async () => {
    const producto = crearProducto({ stock: 5 });
    const orden = await crearOrden({ cliente, direccion: {}, entregaId: 'retiro', items: [{ producto, cantidad: 2 }] });
    const respuesta = await pagarOrden(orden.id, 'aprobado', 0);
    expect(respuesta.ok).toBeTrue();
    expect(respuesta.codigo).toBe('ORDER00001');
    expect(obtener('ordenes', orden.id).estado).toBe('pagada');
    expect(productoEnServidor(producto.id).stock).toBe(3);
  });

  it('un pago rechazado deja la orden rechazada y no toca el stock', async () => {
    const producto = crearProducto({ stock: 5 });
    const orden = await crearOrden({ cliente, direccion: {}, entregaId: 'retiro', items: [{ producto, cantidad: 2 }] });
    const respuesta = await pagarOrden(orden.id, 'rechazado', 0);
    expect(respuesta.ok).toBeFalse();
    expect(respuesta.motivo).toBe('El banco rechazó la transacción.');
    expect(obtener('ordenes', orden.id).estado).toBe('rechazada');
    expect(productoEnServidor(producto.id).stock).toBe(5);
  });

  it('un reintento aprobado de una orden rechazada la deja pagada', async () => {
    const producto = crearProducto({ stock: 5 });
    const orden = await crearOrden({ cliente, direccion: {}, entregaId: 'retiro', items: [{ producto, cantidad: 1 }] });
    await pagarOrden(orden.id, 'rechazado', 0);
    await pagarOrden(orden.id, 'aprobado', 0);
    expect(obtener('ordenes', orden.id).estado).toBe('pagada');
  });

  it('informa cuando la orden no existe', async () => {
    const respuesta = await pagarOrden(999, 'aprobado', 0);
    expect(respuesta.ok).toBeFalse();
  });
});
