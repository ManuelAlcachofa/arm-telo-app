// "Base de datos" simulada en JavaScript con persistencia en localStorage.
// Ofrece operaciones CRUD genéricas sobre colecciones (productos, categorias, usuarios, ordenes, mensajes)
// y un mecanismo de suscripción para que los componentes de React se actualicen en tiempo real.
import { SEMILLAS } from './seed.js';

const PREFIJO = 'armatelo:';
export const COLECCIONES = ['productos', 'categorias', 'usuarios', 'ordenes', 'mensajes'];

const cache = {};
const oyentes = new Set();

function leerAlmacenamiento(coleccion) {
  try {
    const crudo = window.localStorage.getItem(PREFIJO + coleccion);
    return crudo ? JSON.parse(crudo) : null;
  } catch {
    return null;
  }
}

function escribirAlmacenamiento(coleccion, datos) {
  try {
    window.localStorage.setItem(PREFIJO + coleccion, JSON.stringify(datos));
  } catch {
    // Si el navegador bloquea el almacenamiento, los datos viven solo en memoria.
  }
}

function guardar(coleccion, datos) {
  cache[coleccion] = datos;
  escribirAlmacenamiento(coleccion, datos);
  oyentes.forEach((avisar) => avisar());
}

/** READ: devuelve la lista completa. La referencia no cambia mientras no haya modificaciones. */
export function listar(coleccion) {
  if (!cache[coleccion]) {
    const guardado = leerAlmacenamiento(coleccion);
    cache[coleccion] = guardado ?? JSON.parse(JSON.stringify(SEMILLAS[coleccion] ?? []));
    if (guardado === null) escribirAlmacenamiento(coleccion, cache[coleccion]);
  }
  return cache[coleccion];
}

/** READ: devuelve un registro por id (o null). */
export function obtener(coleccion, id) {
  return listar(coleccion).find((x) => String(x.id) === String(id)) ?? null;
}

/** CREATE: agrega un registro y le asigna un id autoincremental. */
export function crear(coleccion, datos) {
  const lista = listar(coleccion);
  const id = lista.reduce((mayor, x) => Math.max(mayor, Number(x.id) || 0), 0) + 1;
  const nuevo = { ...datos, id };
  guardar(coleccion, [...lista, nuevo]);
  return nuevo;
}

/** UPDATE: mezcla los cambios en un registro existente. Devuelve el registro o null si no existe. */
export function actualizar(coleccion, id, cambios) {
  let resultado = null;
  const lista = listar(coleccion).map((x) => {
    if (String(x.id) !== String(id)) return x;
    resultado = { ...x, ...cambios, id: x.id };
    return resultado;
  });
  if (resultado) guardar(coleccion, lista);
  return resultado;
}

/** DELETE: elimina un registro. Devuelve true si existía. */
export function eliminar(coleccion, id) {
  const antes = listar(coleccion);
  const despues = antes.filter((x) => String(x.id) !== String(id));
  if (despues.length === antes.length) return false;
  guardar(coleccion, despues);
  return true;
}

/** Permite que React se entere de los cambios (se usa con useSyncExternalStore). */
export function suscribir(avisar) {
  oyentes.add(avisar);
  return () => oyentes.delete(avisar);
}

/** Borra todo y vuelve a los datos iniciales (útil para pruebas). */
export function reiniciarDB() {
  COLECCIONES.forEach((c) => {
    delete cache[c];
    try {
      window.localStorage.removeItem(PREFIJO + c);
    } catch {
      // sin almacenamiento disponible
    }
  });
  oyentes.forEach((avisar) => avisar());
}
