import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ListaProductos from './ListaProductos.jsx';

const PRODUCTOS = [
  { id: 1, nombre: 'Ryzen 5', precio: 130000, precioOferta: '', stock: 4, categoriaId: 1 },
  { id: 2, nombre: 'RTX 4060', precio: 400000, precioOferta: 350000, stock: '', categoriaId: 2 },
  { id: 3, nombre: 'SSD 1 TB', precio: 60000, precioOferta: '', stock: 0, categoriaId: 3 },
];
const CATEGORIAS = [{ id: 1, nombre: 'Procesadores' }];

const dibujar = (props) =>
  render(
    <MemoryRouter>
      <ListaProductos categorias={CATEGORIAS} onAgregar={() => {}} {...props} />
    </MemoryRouter>,
  );

describe('<ListaProductos />', () => {
  it('muestra todos los productos de la lista', () => {
    dibujar({ productos: PRODUCTOS });
    expect(screen.getAllByRole('article').length).toBe(3);
    expect(screen.getByText('Procesadores')).toBeTruthy();
  });

  it('muestra el mensaje de lista vacía cuando no hay productos', () => {
    dibujar({ productos: [], mensajeVacio: 'Aún no hay productos disponibles.' });
    expect(screen.queryByRole('article')).toBeNull();
    expect(screen.getByText('Aún no hay productos disponibles.')).toBeTruthy();
  });

  it('muestra el precio de oferta y la etiqueta cuando corresponde', () => {
    dibujar({ productos: PRODUCTOS });
    expect(screen.getAllByText('Oferta').length).toBe(1);
  });

  it('deshabilita "Añadir" en los productos con stock en blanco o en 0', () => {
    dibujar({ productos: PRODUCTOS });
    expect(screen.getAllByRole('button', { name: 'Sin stock' }).length).toBe(2);
    expect(screen.getByRole('button', { name: 'Añadir' }).disabled).toBeFalse();
  });

  it('envía el producto elegido a onAgregar', () => {
    const alAgregar = jasmine.createSpy('alAgregar');
    dibujar({ productos: PRODUCTOS, onAgregar: alAgregar });
    fireEvent.click(screen.getByRole('button', { name: 'Añadir' }));
    expect(alAgregar).toHaveBeenCalledWith(PRODUCTOS[0]);
  });
});
