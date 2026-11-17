// Backend falso para las pruebas (Vitest y Karma).
// Reemplaza el "adaptador" de axios: las peticiones no salen a la red y se responden en memoria
// con las mismas rutas, formatos y reglas que los microservicios reales (API Gateway /api/v1).
import { AxiosError } from 'axios';
import { desdeApi } from '../data/adaptadores.js';
import { SEMILLAS } from '../data/seed.js';
import { api } from '../services/api.js';

const ENVIO = { despacho: 3990, retiro: 0 };
let bd;

const clonar = (x) => JSON.parse(JSON.stringify(x));
const nulo = (v) => (v === '' || v === undefined ? null : v);

function nuevoId(coleccion) {
  bd.ids[coleccion] = (bd.ids[coleccion] ?? 0) + 1;
  return bd.ids[coleccion];
}

/** Deja el backend falso con los datos iniciales (las mismas semillas del frontend). */
export function reiniciarServidor() {
  bd = { productos: [], categorias: [], usuarios: [], ordenes: [], mensajes: [], ids: {} };
  SEMILLAS.categorias.forEach((c) => bd.categorias.push({ ...clonar(c) }));
  bd.ids.categorias = bd.categorias.length;
  SEMILLAS.usuarios.forEach((u) => bd.usuarios.push({ ...clonar(u), id: nuevoId('usuarios') }));
}
reiniciarServidor();

// ---------- Formatos de respuesta (iguales a los DTO del backend) ----------

const usuarioPublico = ({ password, ...u }) => ({
  ...u,
  telefono: nulo(u.telefono),
  region: nulo(u.region),
  comuna: nulo(u.comuna),
  calle: nulo(u.calle),
  departamento: nulo(u.departamento),
});

function productoPublico(p) {
  const enOferta = p.precioOferta !== null && p.precioOferta > 0 && p.precioOferta < p.precio;
  const stock = p.stock === null ? 0 : p.stock;
  return {
    ...p,
    categoriaNombre: bd.categorias.find((c) => c.id === p.categoriaId)?.nombre ?? '',
    enOferta,
    precioFinal: enOferta ? p.precioOferta : p.precio,
    critico: stock <= p.stockCritico,
  };
}

const ordenPublica = (o) => ({ ...clonar(o), codigo: `ORDER${String(o.id).padStart(5, '0')}` });

function guardarProducto(d, id) {
  return {
    id,
    nombre: d.nombre,
    marca: nulo(d.marca),
    descripcion: nulo(d.descripcion),
    categoriaId: Number(d.categoriaId),
    precio: Number(d.precio),
    precioOferta: nulo(d.precioOferta) === null ? null : Number(d.precioOferta),
    stock: nulo(d.stock) === null ? null : Number(d.stock),
    stockCritico: Number(d.stockCritico ?? 5),
    imagen: nulo(d.imagen),
  };
}

// ---------- Ayudas para las pruebas ----------

/** Agrega un producto directamente en el backend falso y lo devuelve con el formato del frontend. */
export function agregarProducto(datos) {
  const p = guardarProducto(datos, nuevoId('productos'));
  bd.productos.push(p);
  return desdeApi.productos(productoPublico(p));
}

export const productoEnServidor = (id) => bd.productos.find((p) => p.id === Number(id)) ?? null;
export const usuariosEnServidor = () => bd.usuarios.map(usuarioPublico);
export const ordenesEnServidor = () => clonar(bd.ordenes);

/** Sesión lista para guardar en localStorage ("armatelo:sesion"). */
export function sesionDe(correo) {
  const u = bd.usuarios.find((x) => x.correo === correo);
  return { token: `token-${u.id}`, usuario: desdeApi.usuarios(usuarioPublico(u)) };
}

// ---------- Rutas ----------

class ErrorHttp extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

const exigir = (condicion, status, mensaje) => {
  if (!condicion) throw new ErrorHttp(status, mensaje);
};

function usuarioDelToken(config) {
  const encabezado = config.headers?.Authorization ?? config.headers?.authorization;
  const id = Number(String(encabezado ?? '').replace('Bearer token-', ''));
  return bd.usuarios.find((u) => u.id === id) ?? null;
}

function soloAdmin(yo) {
  exigir(yo, 401, 'Debes iniciar sesión.');
  exigir(yo.rol === 'admin', 403, 'No tienes permisos para realizar esta acción.');
}

function responderLogin(u) {
  return { token: `token-${u.id}`, tipo: 'Bearer', expiraEnMinutos: 480, usuario: usuarioPublico(u) };
}

function crearOrden(cuerpo, yo) {
  const cantidades = new Map();
  cuerpo.items.forEach((i) => cantidades.set(i.productoId, (cantidades.get(i.productoId) ?? 0) + i.cantidad));
  const items = [];
  const sinStock = [];
  cantidades.forEach((cantidad, productoId) => {
    const p = productoEnServidor(productoId);
    exigir(p, 404, `No encontramos el producto con id ${productoId}.`);
    if (cantidad > (p.stock ?? 0)) sinStock.push(p.nombre);
    const precio = productoPublico(p).precioFinal;
    items.push({ productoId: p.id, categoriaId: p.categoriaId, nombre: p.nombre, precio, cantidad, subtotal: precio * cantidad });
  });
  exigir(sinStock.length === 0, 409, `No hay stock suficiente de: ${sinStock.join(', ')}. Ajusta las cantidades en tu carrito.`);
  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
  const envio = ENVIO[cuerpo.entrega] ?? 0;
  const id = nuevoId('ordenes');
  const hoy = new Date();
  const dia = `${hoy.getFullYear()}${String(hoy.getMonth() + 1).padStart(2, '0')}${String(hoy.getDate()).padStart(2, '0')}`;
  const orden = {
    id,
    numero: `${dia}${String(id).padStart(2, '0')}`,
    usuarioId: yo?.id ?? null,
    cliente: { ...cuerpo.cliente, correo: cuerpo.cliente.correo.toLowerCase() },
    direccion: cuerpo.entrega === 'despacho' ? cuerpo.direccion : null,
    entrega: cuerpo.entrega,
    items,
    subtotal,
    envio,
    total: subtotal + envio,
    estado: 'pendiente',
    motivo: null,
    fecha: hoy.toISOString(),
    fechaPago: null,
  };
  bd.ordenes.push(orden);
  return orden;
}

function pagarOrden(orden, resultado) {
  exigir(orden.estado !== 'pagada', 409, 'La orden ya fue pagada.');
  if (resultado === 'rechazado') {
    Object.assign(orden, { estado: 'rechazada', motivo: 'El banco rechazó la transacción.' });
    return { ok: false, codigo: null, motivo: orden.motivo, orden: ordenPublica(orden) };
  }
  const sinStock = orden.items.filter((i) => i.cantidad > (productoEnServidor(i.productoId)?.stock ?? 0)).map((i) => i.nombre);
  if (sinStock.length > 0) {
    Object.assign(orden, { estado: 'rechazada', motivo: `No hay stock suficiente de: ${sinStock.join(', ')}.` });
    return { ok: false, codigo: null, motivo: orden.motivo, orden: ordenPublica(orden) };
  }
  orden.items.forEach((i) => {
    const p = productoEnServidor(i.productoId);
    if (p.stock !== null) p.stock = Math.max(0, p.stock - i.cantidad);
  });
  Object.assign(orden, { estado: 'pagada', motivo: null, fechaPago: new Date().toISOString() });
  const publica = ordenPublica(orden);
  return { ok: true, codigo: publica.codigo, motivo: null, orden: publica };
}

function atender(metodo, ruta, cuerpo, params, yo) {
  const [, recurso, id, accion] = ruta.split('/');
  const numero = Number(id);

  // auth-service
  if (recurso === 'auth') {
    if (id === 'login' && metodo === 'post') {
      const u = bd.usuarios.find((x) => x.correo.toLowerCase() === String(cuerpo.correo).toLowerCase() && x.password === cuerpo.password);
      exigir(u, 401, 'Correo o contraseña incorrectos.');
      return [200, responderLogin(u)];
    }
    if (id === 'registro' && metodo === 'post') {
      const correo = cuerpo.correo.toLowerCase();
      exigir(!bd.usuarios.some((u) => u.correo === correo), 409, 'Ya existe una cuenta con ese correo.');
      const u = { telefono: '', region: '', comuna: '', calle: '', departamento: '', ...cuerpo, correo, rol: 'cliente', id: nuevoId('usuarios') };
      bd.usuarios.push(u);
      return [201, responderLogin(u)];
    }
    if (id === 'me' && metodo === 'get') {
      exigir(yo, 401, 'Debes iniciar sesión.');
      return [200, usuarioPublico(yo)];
    }
  }

  if (recurso === 'usuarios') {
    if (id === 'me') {
      exigir(yo, 401, 'Debes iniciar sesión.');
      if (metodo === 'put') {
        const { correo, rol, id: _id, password, ...cambios } = cuerpo;
        Object.assign(yo, cambios, password ? { password } : {});
      }
      return [200, usuarioPublico(yo)];
    }
    soloAdmin(yo);
    if (metodo === 'get' && !id) return [200, bd.usuarios.map(usuarioPublico)];
    if (metodo === 'post') {
      exigir(!bd.usuarios.some((u) => u.correo === cuerpo.correo), 409, 'Ya existe una cuenta con ese correo.');
      const u = { ...cuerpo, id: nuevoId('usuarios') };
      bd.usuarios.push(u);
      return [201, usuarioPublico(u)];
    }
    const u = bd.usuarios.find((x) => x.id === numero);
    exigir(u, 404, `No encontramos el usuario con id ${id}.`);
    if (metodo === 'put') {
      const { password, ...cambios } = cuerpo;
      Object.assign(u, cambios, password ? { password } : {});
      return [200, usuarioPublico(u)];
    }
    if (metodo === 'delete') {
      exigir(u.id !== yo.id, 400, 'No puedes eliminar tu propia cuenta.');
      bd.usuarios = bd.usuarios.filter((x) => x !== u);
      return [204, null];
    }
  }

  // catalogo-service
  if (recurso === 'productos') {
    if (metodo === 'get' && !id) return [200, bd.productos.map(productoPublico)];
    if (metodo === 'get') {
      const p = productoEnServidor(numero);
      exigir(p, 404, `No encontramos el producto con id ${id}.`);
      return [200, productoPublico(p)];
    }
    soloAdmin(yo);
    if (metodo === 'post') {
      const p = guardarProducto(cuerpo, nuevoId('productos'));
      bd.productos.push(p);
      return [201, productoPublico(p)];
    }
    const i = bd.productos.findIndex((p) => p.id === numero);
    exigir(i >= 0, 404, `No encontramos el producto con id ${id}.`);
    if (metodo === 'put') {
      bd.productos[i] = guardarProducto(cuerpo, numero);
      return [200, productoPublico(bd.productos[i])];
    }
    if (metodo === 'delete') {
      bd.productos.splice(i, 1);
      return [204, null];
    }
  }

  if (recurso === 'categorias') {
    if (metodo === 'get' && !id) return [200, clonar(bd.categorias)];
    soloAdmin(yo);
    if (metodo === 'post') {
      const c = { id: nuevoId('categorias'), nombre: cuerpo.nombre, descripcion: cuerpo.descripcion, icono: cuerpo.icono ?? 'bi-tag' };
      bd.categorias.push(c);
      return [201, c];
    }
    const c = bd.categorias.find((x) => x.id === numero);
    exigir(c, 404, `No encontramos la categoría con id ${id}.`);
    if (metodo === 'put') return [200, Object.assign(c, { nombre: cuerpo.nombre, descripcion: cuerpo.descripcion, icono: cuerpo.icono })];
    if (metodo === 'delete') {
      exigir(!bd.productos.some((p) => p.categoriaId === c.id), 409, 'No se puede eliminar: la categoría tiene productos asociados.');
      bd.categorias = bd.categorias.filter((x) => x !== c);
      return [204, null];
    }
  }

  // orden-service
  if (recurso === 'ordenes') {
    if (metodo === 'post' && !id) return [201, ordenPublica(crearOrden(cuerpo, yo))];
    if (metodo === 'get' && id === 'mias') {
      exigir(yo, 401, 'Debes iniciar sesión.');
      return [200, bd.ordenes.filter((o) => o.usuarioId === yo.id || o.cliente.correo === yo.correo).map(ordenPublica).reverse()];
    }
    if (metodo === 'get' && !id) {
      soloAdmin(yo);
      return [200, bd.ordenes.map(ordenPublica).reverse()];
    }
    const orden = bd.ordenes.find((o) => o.id === numero);
    exigir(orden, 404, `No encontramos la orden con id ${id}.`);
    if (metodo === 'post' && accion === 'pago') return [200, pagarOrden(orden, cuerpo?.resultado ?? 'aprobado')];
    if (metodo === 'get') {
      const puede = yo?.rol === 'admin' || orden.usuarioId === yo?.id || orden.cliente.correo === yo?.correo
        || String(params?.correo ?? '').toLowerCase() === orden.cliente.correo;
      exigir(puede, 403, 'No tienes acceso a esta orden.');
      return [200, ordenPublica(orden)];
    }
  }

  // contacto-service
  if (recurso === 'mensajes' && metodo === 'post') {
    const m = { ...cuerpo, id: nuevoId('mensajes'), fecha: new Date().toISOString() };
    bd.mensajes.push(m);
    return [201, m];
  }

  throw new ErrorHttp(404, 'La ruta solicitada no existe.');
}

/** Adaptador de axios: responde como si fuera el backend. */
async function adaptador(config) {
  const cuerpo = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
  const ruta = (config.url ?? '').split('?')[0];
  let status;
  let data;
  try {
    [status, data] = atender((config.method ?? 'get').toLowerCase(), ruta, cuerpo, config.params, usuarioDelToken(config));
  } catch (error) {
    if (!(error instanceof ErrorHttp)) throw error;
    status = error.status;
    data = { status, error: 'Error', mensaje: error.message, ruta, campos: null };
  }
  const respuesta = { data: clonar(data), status, statusText: String(status), headers: {}, config, request: {} };
  if (status >= 400) throw new AxiosError(data.mensaje, AxiosError.ERR_BAD_REQUEST, config, {}, respuesta);
  return respuesta;
}

/** Conecta el cliente HTTP de la aplicación con este backend falso. */
export function instalarServidorFalso() {
  api.defaults.adapter = adaptador;
}
