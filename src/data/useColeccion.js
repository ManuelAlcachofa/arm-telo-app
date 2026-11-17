import { useSyncExternalStore } from 'react';
import { listar, obtenerVersion, suscribir } from './db.js';

/** Hook que conecta un componente de React con una colección de datos (cargada desde el backend). */
export function useColeccion(nombre) {
  return useSyncExternalStore(suscribir, () => listar(nombre));
}

/** Hace que el componente se vuelva a dibujar con cualquier cambio de la capa de datos. */
export function useVersionDatos() {
  return useSyncExternalStore(suscribir, obtenerVersion);
}
