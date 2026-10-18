// Utilidades compartidas por las pruebas.
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';
import { CarritoProvider } from '../context/CarritoContext.jsx';
import { crear, reiniciarDB } from '../data/db.js';

/** Deja el navegador y la base de datos simulada como recién abiertos. */
export function limpiarTodo() {
  window.localStorage.clear();
  reiniciarDB();
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

export function crearProducto(cambios = {}) {
  return crear('productos', { ...DATOS_PRODUCTO, ...cambios });
}
