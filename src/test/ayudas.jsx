// Utilidades compartidas por las pruebas.
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';
import { CarritoProvider } from '../context/CarritoContext.jsx';
import { reiniciarDB } from '../data/db.js';
import { agregarProducto, reiniciarServidor, sesionDe } from './servidorFalso.js';

/** Deja el navegador, la caché de datos y el backend falso como recién abiertos. */
export function limpiarTodo() {
  window.localStorage.clear();
  window.sessionStorage.clear();
  reiniciarServidor();
  reiniciarDB();
}

/** Deja la sesión iniciada (como si la persona hubiera hecho login). */
export function iniciarSesionComo(correo = 'admin@armatelo.cl') {
  window.localStorage.setItem('armatelo:sesion', JSON.stringify(sesionDe(correo)));
  reiniciarDB();
}

/**
 * Espera a que una condición se cumpla (por ejemplo, a que responda el backend).
 * Se usa en vez de waitFor(() => expect(...)) porque en Jasmine (Karma) expect no lanza errores.
 */
export function esperarQue(condicion, opciones) {
  return waitFor(() => {
    if (!condicion()) throw new Error('La condición todavía no se cumple.');
  }, opciones);
}

/** Dibuja un componente con el router y los contextos (sesión y carrito) que usa la aplicación. */
export function renderizarConApp(ui, { ruta = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <AuthProvider>
        <CarritoProvider>{ui}</CarritoProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

export const DATOS_PRODUCTO = {
  nombre: 'Ryzen 5 5600',
  marca: 'AMD',
  descripcion: 'Procesador de 6 núcleos.',
  categoriaId: 1,
  precio: 100000,
  precioOferta: '',
  stock: 5,
  stockCritico: 2,
  imagen: '',
};

/** Crea un producto en el backend falso y lo devuelve con el formato del frontend. */
export function crearProducto(cambios = {}) {
  return agregarProducto({ ...DATOS_PRODUCTO, ...cambios });
}
