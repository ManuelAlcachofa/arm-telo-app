import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { useColeccion } from '../data/useColeccion.js';
import { precioFinal, stockNumerico } from '../utils/productos.js';

const CLAVE_CARRITO = 'armatelo:carrito';

/**
 * Reducer puro del carrito. El estado es una lista de líneas { id, cantidad }.
 * `max` es el stock disponible: nunca se permite superarlo.
 */
export function carritoReducer(estado, accion) {
  switch (accion.tipo) {
    case 'agregar': {
      if (!(accion.max > 0)) return estado;
      const existente = estado.find((l) => String(l.id) === String(accion.id));
      if (!existente) return [...estado, { id: accion.id, cantidad: Math.min(accion.cantidad, accion.max) }];
      return estado.map((l) =>
        l === existente ? { ...l, cantidad: Math.min(l.cantidad + accion.cantidad, accion.max) } : l,
      );
    }
    case 'cambiar': {
      if (accion.cantidad <= 0) return estado.filter((l) => String(l.id) !== String(accion.id));
      return estado.map((l) =>
        String(l.id) === String(accion.id) ? { ...l, cantidad: Math.min(accion.cantidad, accion.max) } : l,
      );
    }
    case 'quitar':
      return estado.filter((l) => String(l.id) !== String(accion.id));
    case 'vaciar':
      return [];
    default:
      return estado;
  }
}

function leerCarritoGuardado() {
  try {
    const guardado = JSON.parse(window.localStorage.getItem(CLAVE_CARRITO));
    return Array.isArray(guardado) ? guardado : [];
  } catch {
    return [];
  }
}

const CarritoContext = createContext(null);

export function CarritoProvider({ children }) {
  const productos = useColeccion('productos');
  const [lineas, dispatch] = useReducer(carritoReducer, undefined, leerCarritoGuardado);

  // Persistencia: el carrito sobrevive a recargar la página.
  useEffect(() => {
    try {
      window.localStorage.setItem(CLAVE_CARRITO, JSON.stringify(lineas));
    } catch {
      // sin almacenamiento disponible
    }
  }, [lineas]);

  const items = useMemo(
    () =>
      lineas
        .map((l) => ({ producto: productos.find((p) => String(p.id) === String(l.id)), cantidad: l.cantidad }))
        .filter((i) => i.producto),
    [lineas, productos],
  );

  const total = useMemo(() => items.reduce((suma, i) => suma + precioFinal(i.producto) * i.cantidad, 0), [items]);
  const cantidadTotal = useMemo(() => items.reduce((suma, i) => suma + i.cantidad, 0), [items]);

  const agregar = useCallback(
    (producto, cantidad = 1) =>
      dispatch({ tipo: 'agregar', id: producto.id, cantidad, max: stockNumerico(producto) }),
    [],
  );
  const cambiarCantidad = useCallback(
    (producto, cantidad) =>
      dispatch({ tipo: 'cambiar', id: producto.id, cantidad, max: stockNumerico(producto) }),
    [],
  );
  const quitar = useCallback((producto) => dispatch({ tipo: 'quitar', id: producto.id }), []);
  const vaciar = useCallback(() => dispatch({ tipo: 'vaciar' }), []);

  const valor = useMemo(
    () => ({ items, total, cantidadTotal, agregar, cambiarCantidad, quitar, vaciar }),
    [items, total, cantidadTotal, agregar, cambiarCantidad, quitar, vaciar],
  );

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>;
}

export function useCarrito() {
  const contexto = useContext(CarritoContext);
  if (!contexto) throw new Error('useCarrito debe usarse dentro de <CarritoProvider>');
  return contexto;
}
