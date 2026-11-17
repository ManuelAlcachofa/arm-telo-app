// Prueba de integración
// Crea un producto, órdenes, un cliente y un mensaje de prueba; al final elimina el producto y el cliente.
import { api, guardarSesion, mensajeDeError } from '../src/services/api.js';
import { desdeApi } from '../src/data/adaptadores.js';
import { actualizar, cargar, crear, eliminar, listar, obtener, reiniciarDB } from '../src/data/db.js';
import { crearOrden, pagarOrden } from '../src/services/compras.js';

const sufijo = Date.now();
let productoId;
let usuarioClienteId;
let ordenInvitado;

async function entrarComo(correo, password) {
  const { data } = await api.post('/auth/login', { correo, password });
  guardarSesion({ token: data.token, usuario: desdeApi.usuarios(data.usuario) });
  reiniciarDB();
  return data;
}

function salir() {
  guardarSesion(null);
  reiniciarDB();
}

async function error(promesa) {
  try {
    await promesa;
    return null;
  } catch (e) {
    return e;
  }
}

describe('Integración real frontend ↔ backend (gateway :9090)', () => {
  beforeAll(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    reiniciarDB();
  });

  it('1. catálogo público: 9 productos y 8 categorías con el formato del frontend', async () => {
    await cargar('productos');
    await cargar('categorias');
    expect(listar('categorias').length).toBe(8);
    expect(listar('productos').length).toBeGreaterThanOrEqual(9);
    const gabinete = listar('productos').find((p) => p.nombre === 'Gabinete ATX Airflow');
    expect(gabinete.stock).toBe(''); // null del backend → '' (stock por definir)
    expect(listar('productos').find((p) => p.nombre === 'Ryzen 5 5600').precioFinal).toBe(114990);
  });

  it('2. login incorrecto devuelve el mensaje del backend', async () => {
    const e = await error(api.post('/auth/login', { correo: 'admin@armatelo.cl', password: 'mala-clave' }));
    expect(e.response.status).toBe(401);
    expect(mensajeDeError(e)).toBe('Correo o contraseña incorrectos.');
  });

  it('3. sin token o con rol cliente no se accede a rutas de admin (401 / 403)', async () => {
    expect((await error(api.get('/usuarios'))).response.status).toBe(401);
    await entrarComo('cliente@armatelo.cl', 'Cliente1234');
    expect((await error(api.get('/usuarios'))).response.status).toBe(403);
    expect((await error(api.get('/reportes/resumen'))).response.status).toBe(403);
    salir();
  });

  it('4. admin: CRUD de productos con db.js (campos vacíos → null)', async () => {
    await entrarComo('admin@armatelo.cl', 'Admin1234');
    await cargar('productos');
    const nuevo = await crear('productos', {
      nombre: `Producto E2E ${sufijo}`, marca: 'Test', categoriaId: 1, descripcion: '',
      precio: 10000, precioOferta: '', stock: 3, stockCritico: 1, imagen: '',
    });
    productoId = nuevo.id;
    expect(nuevo.precioOferta).toBe('');
    const editado = await actualizar('productos', productoId, { precioOferta: 8000 });
    expect(editado.precioFinal).toBe(8000);
    expect(editado.nombre).toBe(`Producto E2E ${sufijo}`); // actualizar mezcla con lo existente
    expect(obtener('productos', productoId).enOferta).toBe(true);
  });

  it('5. admin: no se elimina una categoría con productos (409 con mensaje)', async () => {
    const e = await error(eliminar('categorias', 1));
    expect(e.response.status).toBe(409);
    expect(mensajeDeError(e)).toContain('productos asociados');
  });

  it('6. invitado: checkout, pago rechazado, reintento aprobado y stock descontado', async () => {
    salir();
    await cargar('productos');
    const producto = obtener('productos', productoId);
    ordenInvitado = await crearOrden({
      cliente: { nombre: 'Ana', apellidos: 'Invitada', correo: `ana.${sufijo}@correo.cl` },
      direccion: { calle: 'Av. Siempre Viva 123', departamento: '', region: 'Región Metropolitana', comuna: 'Santiago', indicaciones: '' },
      entregaId: 'despacho',
      items: [{ producto, cantidad: 2 }],
    });
    expect(ordenInvitado.estado).toBe('pendiente');
    expect(ordenInvitado.entregaId).toBe('despacho');
    expect(ordenInvitado.total).toBe(2 * 8000 + 3990);

    const rechazo = await pagarOrden(ordenInvitado.id, 'rechazado', 0);
    expect(rechazo.ok).toBe(false);
    expect(obtener('ordenes', ordenInvitado.id).estado).toBe('rechazada');

    const pago = await pagarOrden(ordenInvitado.id, 'aprobado', 0);
    expect(pago.ok).toBe(true);
    expect(pago.codigo).toBe(`ORDER${String(ordenInvitado.id).padStart(5, '0')}`);
    await cargar('productos', { forzar: true });
    expect(obtener('productos', productoId).stock).toBe(1);
  });

  it('7. invitado: recupera su boleta al recargar (correo guardado en la pestaña)', async () => {
    reiniciarDB();
    await cargar('ordenes');
    expect(obtener('ordenes', ordenInvitado.id).estado).toBe('pagada');
  });

  it('8. el backend rechaza una orden sin stock suficiente', async () => {
    await cargar('productos');
    const e = await error(crearOrden({
      cliente: { nombre: 'Ana', apellidos: 'Invitada', correo: `ana.${sufijo}@correo.cl` },
      direccion: {}, entregaId: 'retiro',
      items: [{ producto: obtener('productos', productoId), cantidad: 5 }],
    }));
    expect(e.response.status).toBe(409);
    expect(mensajeDeError(e)).toContain(`Producto E2E ${sufijo}`);
  });

  it('9. cliente: registro, perfil, compra asociada a su cuenta y privacidad de boletas', async () => {
    const correo = `cliente.${sufijo}@correo.cl`;
    const { data } = await api.post('/auth/registro', { nombre: 'Carla', apellidos: 'Prueba', correo, password: 'Clave1234' });
    expect(data.usuario.rol).toBe('cliente');
    usuarioClienteId = data.usuario.id;
    guardarSesion({ token: data.token, usuario: desdeApi.usuarios(data.usuario) });
    reiniciarDB();

    const perfil = (await api.put('/usuarios/me', { ...data.usuario, telefono: '+56911112222' })).data;
    expect(perfil.telefono).toBe('+56911112222');

    await cargar('productos');
    const orden = await crearOrden({
      cliente: { nombre: 'Carla', apellidos: 'Prueba', correo }, direccion: {}, entregaId: 'retiro',
      items: [{ producto: obtener('productos', productoId), cantidad: 1 }],
    });
    expect(orden.usuarioId).toBe(usuarioClienteId);
    await cargar('ordenes');
    expect(listar('ordenes').some((o) => o.id === orden.id)).toBe(true); // /ordenes/mias
    expect((await error(api.get(`/ordenes/${ordenInvitado.id}`))).response.status).toBe(403); // boleta ajena
  });

  it('10. contacto: un invitado envía un mensaje', async () => {
    salir();
    const m = await crear('mensajes', { nombre: 'Ana', correo: `ana.${sufijo}@correo.cl`, asunto: 'Consulta', mensaje: 'Hola', fecha: 'x' });
    expect(m.id).toBeTruthy();
  });

  it('11. admin: órdenes, historial, reportes, mensajes y limpieza', async () => {
    await entrarComo('admin@armatelo.cl', 'Admin1234');
    await cargar('ordenes');
    expect(obtener('ordenes', ordenInvitado.id)).toBeTruthy();
    const historial = (await api.get('/ordenes', { params: { usuarioId: usuarioClienteId, correo: `cliente.${sufijo}@correo.cl` } })).data;
    expect(historial.length).toBe(1);
    const reporte = (await api.get('/reportes/resumen')).data;
    expect(reporte.cantidadPagadas).toBeGreaterThanOrEqual(1);
    expect(reporte.totalUsuarios).toBeGreaterThanOrEqual(3); // usa auth-service por la ruta interna
    expect((await api.get('/mensajes')).data.length).toBeGreaterThanOrEqual(1);

    await cargar('usuarios');
    expect(await eliminar('usuarios', usuarioClienteId)).toBe(true);
    await cargar('productos');
    expect(await eliminar('productos', productoId)).toBe(true);
    salir();
  });
});
