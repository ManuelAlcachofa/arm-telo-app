import { fireEvent, render, screen } from '@testing-library/react';
import TablaItems from './TablaItems.jsx';

const FILAS = [
  { id: 1, nombre: 'Ryzen 5', precio: 100000, cantidad: 2, max: 5 },
  { id: 2, nombre: 'SSD 1 TB', precio: 50000, cantidad: 1, max: 1 },
];

describe('<TablaItems />', () => {
  it('muestra una fila por cada producto con su subtotal', () => {
    render(<TablaItems filas={FILAS} />);
    expect(screen.getAllByRole('row').length).toBe(3); // encabezado + 2 productos
    expect(screen.getByText('Ryzen 5')).toBeTruthy();
    expect(screen.getByText(/200\.000/)).toBeTruthy();
  });

  it('en modo de solo lectura no muestra botones de acción', () => {
    render(<TablaItems filas={FILAS} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('en modo editable llama a onCambiar con la nueva cantidad', () => {
    const alCambiar = jasmine.createSpy('alCambiar');
    render(<TablaItems filas={FILAS} editable onCambiar={alCambiar} onQuitar={() => {}} />);
    fireEvent.click(screen.getByLabelText('Aumentar cantidad de Ryzen 5'));
    expect(alCambiar).toHaveBeenCalledWith(1, 3);
    fireEvent.click(screen.getByLabelText('Disminuir cantidad de Ryzen 5'));
    expect(alCambiar).toHaveBeenCalledWith(1, 1);
  });

  it('deshabilita el botón + al llegar al stock máximo', () => {
    render(<TablaItems filas={FILAS} editable onCambiar={() => {}} onQuitar={() => {}} />);
    expect(screen.getByLabelText('Aumentar cantidad de SSD 1 TB').disabled).toBeTrue();
  });

  it('llama a onQuitar con el id del producto eliminado', () => {
    const alQuitar = jasmine.createSpy('alQuitar');
    render(<TablaItems filas={FILAS} editable onCambiar={() => {}} onQuitar={alQuitar} />);
    fireEvent.click(screen.getByLabelText('Eliminar SSD 1 TB del carrito'));
    expect(alQuitar).toHaveBeenCalledWith(2);
  });
});
