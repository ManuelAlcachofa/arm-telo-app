// Capa de datos del frontend conectada al backend (microservicios a través del API Gateway).
//
// Mantiene las mismas funciones que la antigua base simulada en localStorage
// (listar, obtener, crear, actualizar, eliminar, suscribir), para que los componentes no cambien:
//  - Lectura (listar / obtener): síncrona, desde una caché en memoria que se llena con la API.
//  - Escritura (crear / actualizar / eliminar): asíncrona; llama a la API y actualiza la caché.
// Cada cambio avisa a los suscriptores, por eso useColeccion() vuelve a dibujar los componentes.
import { api, leerSesion, mensajeDeError } from '../services/api.js';
import { desdeApi, haciaApi } from './adaptadores.js';

export const COLECCIONES = ['productos', 'categorias', 'usuarios', 'ordenes', 'mensajes'];

/** Colecciones que dependen de quién inició sesión (se recargan al entrar o salir). */
export const COLECCIONES_PRIVADAS = ['usuarios', 'ordenes', 'mensajes'];

const RUTAS = { productos: '/productos', categorias: '/categorias', usuarios: '/usuarios', ordenes: '/ordenes', mensajes: '/mensajes' };
const VACIA = Object.freeze([]);
const CLAVE_ORDENES_INVITADO = 'armatelo:ordenes-invitado';

// estado[coleccion] = { datos, carga: 'pendiente' | 'cargando' | 'lista' | 'error', error, cargadaAlgunaVez }
let estado = {};
let version = 0;
const oyentes = new Set();
const agregadosDuranteCarga = {};

function avisar() {
  version += 1;
  oyentes.forEach((avisarA) => avisarA());
}

function entrada(coleccion) {
  if (!estado[coleccion]) estado[coleccion] = { datos: VACIA, carga: 'pendiente', error: '', cargadaAlgunaVez: false, promesa: null };
  return estado[coleccion];
}

function fijar(coleccion, cambios) {
  estado[coleccion] = { ...entrada(coleccion), ...cambios };
  avisar();
}

const mismaId = (a, b) => String(a) === String(b);
const adaptar = (coleccion, registro) => (desdeApi[coleccion] ? desdeApi[coleccion](registro) : registro);

// ---------- Órdenes de invitados (compras sin cuenta) ----------
// El backend solo muestra una orden a un invitado si indica el correo de la compra.
// Se recuerdan en la pestaña para que Compra exitosa / Compra error funcionen al recargar.

function ordenesDeInvitado() {
  try {
    return JSON.parse(window.sessionStorage.getItem(CLAVE_ORDENES_INVITADO)) ?? [];
  } catch {
    return [];
  }
}

export function recordarOrdenInvitado(orden) {
  try {
    const lista = ordenesDeInvitado().filter((o) => !mismaId(o.id, orden.id));
    window.sessionStorage.setItem(CLAVE_ORDENES_INVITADO, JSON.stringify([...lista, { id: orden.id, correo: orden.cliente.correo }]));
  } catch {
    // sin almacenamiento disponible
  }
}

async function descargarOrdenesInvitado() {
  const respuestas = await Promise.all(
    ordenesDeInvitado().map((o) =>
      api.get(`/ordenes/${o.id}`, { params: { correo: o.correo } }).then((r) => r.data).catch(() => null),
    ),
  );
  return respuestas.filter(Boolean);
}

// ---------- Lectura desde la API ----------

/** Qué endpoint se usa para cada colección según quién está conectado. */
async function descargar(coleccion) {
  const sesion = leerSesion();
  const esAdmin = sesion?.usuario?.rol === 'admin';
  switch (coleccion) {
    case 'productos':
    case 'categorias':
      return (await api.get(RUTAS[coleccion])).data;
    case 'usuarios':
    case 'mensajes':
      return esAdmin ? (await api.get(RUTAS[coleccion])).data : [];
    case 'ordenes':
      if (esAdmin) return (await api.get('/ordenes')).data;
      if (sesion) return (await api.get('/ordenes/mias')).data;
      return descargarOrdenesInvitado();
    default:
      return [];
  }
}

/** Carga (o recarga con forzar) una colección desde el backend. Devuelve una promesa. */
export function cargar(coleccion, { forzar = false } = {}) {
  const actual = entrada(coleccion);
  if (!forzar && (actual.carga === 'cargando' || actual.carga === 'lista')) return actual.promesa ?? Promise.resolve(actual.datos);

  agregadosDuranteCarga[coleccion] = [];
  const promesa = descargar(coleccion)
    .then((lista) => {
      // Se conservan los registros guardados localmente mientras la descarga estaba en curso.
      const servidor = lista.map((r) => adaptar(coleccion, r));
      const extra = (agregadosDuranteCarga[coleccion] ?? []).filter((r) => !servidor.some((s) => mismaId(s.id, r.id)));
      const datos = [...servidor, ...extra];
      fijar(coleccion, { datos, carga: 'lista', error: '', cargadaAlgunaVez: true });
      return datos;
    })
    .catch((error) => {
      fijar(coleccion, { carga: 'error', error: mensajeDeError(error, 'No se pudieron cargar los datos.') });
      return entrada(coleccion).datos;
    });
  fijar(coleccion, { carga: 'cargando', promesa });
  return promesa;
}

/** READ: devuelve la lista (desde la caché). Si aún no se cargó, pide los datos al backend. */
export function listar(coleccion) {
  const actual = entrada(coleccion);
  if (actual.carga === 'pendiente') queueMicrotask(() => cargar(coleccion));
  return actual.datos;
}

/** READ: devuelve un registro por id (o null). */
export function obtener(coleccion, id) {
  return listar(coleccion).find((x) => mismaId(x.id, id)) ?? null;
}

// ---------- Escritura en la API ----------

/** Agrega o reemplaza un registro en la caché (por ejemplo, la orden que devuelve el backend). */
export function guardarEnCache(coleccion, registro) {
  const actual = entrada(coleccion);
  if (actual.carga === 'cargando') agregadosDuranteCarga[coleccion]?.push(registro);
  const existe = actual.datos.some((x) => mismaId(x.id, registro.id));
  const datos = existe ? actual.datos.map((x) => (mismaId(x.id, registro.id) ? registro : x)) : [...actual.datos, registro];
  fijar(coleccion, { datos });
  return registro;
}

/** CREATE: lo crea en el backend y devuelve el registro con su id. Lanza un error si la API lo rechaza. */
export async function crear(coleccion, datos) {
  const cuerpo = haciaApi[coleccion] ? haciaApi[coleccion](datos) : datos;
  const { data } = await api.post(RUTAS[coleccion], cuerpo);
  return guardarEnCache(coleccion, adaptar(coleccion, data));
}

/** UPDATE: mezcla los cambios con el registro actual y lo guarda en el backend. */
export async function actualizar(coleccion, id, cambios) {
  const existente = obtener(coleccion, id) ?? {};
  const mezcla = { ...existente, ...cambios };
  const cuerpo = haciaApi[coleccion] ? haciaApi[coleccion](mezcla) : mezcla;
  const { data } = await api.put(`${RUTAS[coleccion]}/${id}`, cuerpo);
  return guardarEnCache(coleccion, adaptar(coleccion, data));
}

/** DELETE: lo elimina en el backend y lo quita de la caché. */
export async function eliminar(coleccion, id) {
  await api.delete(`${RUTAS[coleccion]}/${id}`);
  const actual = entrada(coleccion);
  fijar(coleccion, { datos: actual.datos.filter((x) => !mismaId(x.id, id)) });
  return true;
}

// ---------- Suscripción y estado de carga ----------

/** Permite que React se entere de los cambios (se usa con useSyncExternalStore). */
export function suscribir(avisarA) {
  oyentes.add(avisarA);
  return () => oyentes.delete(avisarA);
}

/** Número que cambia con cada modificación (útil para useSyncExternalStore). */
export function obtenerVersion() {
  return version;
}

/** 'pendiente' | 'cargando' | 'lista' | 'error' */
export function estadoCarga(coleccion) {
  return entrada(coleccion).carga;
}

export function errorCarga(coleccion) {
  return entrada(coleccion).error;
}

export function fueCargada(coleccion) {
  return entrada(coleccion).cargadaAlgunaVez;
}

/** Vacía la caché (todas o algunas colecciones) para que se vuelvan a pedir al backend. */
export function reiniciarDB(colecciones = COLECCIONES) {
  colecciones.forEach((c) => {
    estado[c] = { datos: VACIA, carga: 'pendiente', error: '', cargadaAlgunaVez: false, promesa: null };
  });
  avisar();
}
