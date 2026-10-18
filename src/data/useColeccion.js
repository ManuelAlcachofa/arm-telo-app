import { useSyncExternalStore } from 'react';
import { listar, suscribir } from './db.js';

/** Hook que conecta un componente de React con una colección de la base de datos simulada. */
export function useColeccion(nombre) {
  return useSyncExternalStore(suscribir, () => listar(nombre));
}
