import { fireEvent, screen } from '@testing-library/react';
import { carritoReducer, useCarrito } from './CarritoContext.jsx';
import { crearProducto, limpiarTodo, renderizarConApp } from '../test/ayudas.jsx';

describe('carritoReducer', () => {
  it('agrega un producto nuevo respetando el stock máximo', () => {
    expect(carritoReducer([], { tipo: 'agregar', id: 1, cantidad: 9, max: 3 })).toEqual([{ id: 1, cantidad: 3 }]);
  });

  it('suma cantidades de un producto que ya estaba, sin pasar del stock', () => {
    const estado = [{ id: 1, cantidad: 2 }];
    expect(carritoReducer(estado, { tipo: 'agregar', id: 1, cantidad: 5, max: 4 })).toEqual([{ id: 1, cantidad: 4 }]);
  });

  it('ignora la compra de productos sin stock', () => {
    const estado = [];
    expect(carritoReducer(estado, { tipo: 'agregar', id: 1, cantidad: 1, max: 0 })).toBe(estado);
  });

  it('quita la línea cuando la cantidad baja a 0', () => {
    expect(carritoReducer([{ id: 1, cantidad: 1 }], { tipo: 'cambiar', id: 1, cantidad: 0, max: 5 })).toEqual([]);
  });

  it('vacía el carrito', () => {
    expect(carritoReducer([{ id: 1, cantidad: 1 }], { tipo: 'vaciar' })).toEqual([]);
  });
});

describe('CarritoProvider', () => {
  function Sonda({ producto }) {
    const { items, total, cantidadTotal, agregar, quitar } = useCarrito();
    return (
      <div>
        <p data-testid="resumen">
          {cantidadTotal} unidades, total {total}, líneas {items.length}
        </p>
        <button type="button" onClick={() => agregar(producto)}>
          sumar
        </button>
        <button type="button" onClick={() => quitar(producto)}>
          sacar
        </button>
      </div>
    );
  }

  beforeEach(limpiarTodo);

  it('calcula el total y la cantidad al agregar productos', () => {
    const producto = crearProducto({ precio: 1000, precioOferta: 900, stock: 5 });
    renderizarConApp(<Sonda producto={producto} />);
    fireEvent.click(screen.getByText('sumar'));
    fireEvent.click(screen.getByText('sumar'));
    expect(screen.getByTestId('resumen').textContent).toBe('2 unidades, total 1800, líneas 1');
  });

  it('guarda el carrito en localStorage para que sobreviva a recargar', () => {
    const producto = crearProducto();
    renderizarConApp(<Sonda producto={producto} />);
    fireEvent.click(screen.getByText('sumar'));
    expect(JSON.parse(window.localStorage.getItem('armatelo:carrito'))).toEqual([{ id: producto.id, cantidad: 1 }]);
    fireEvent.click(screen.getByText('sacar'));
    expect(JSON.parse(window.localStorage.getItem('armatelo:carrito'))).toEqual([]);
  });

  it('no deja agregar un producto con el stock en blanco', () => {
    const producto = crearProducto({ stock: '' });
    renderizarConApp(<Sonda producto={producto} />);
    fireEvent.click(screen.getByText('sumar'));
    expect(screen.getByTestId('resumen').textContent).toContain('0 unidades');
  });
});
