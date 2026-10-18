import { fireEvent, render, screen } from '@testing-library/react';
import Boton from './Boton.jsx';

describe('<Boton />', () => {
  it('muestra la etiqueta recibida por props', () => {
    render(<Boton etiqueta="Guardar" />);
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeTruthy();
  });

  it('ejecuta la función onClick al hacer clic', () => {
    const alClic = jasmine.createSpy('alClic');
    render(<Boton etiqueta="Guardar" onClick={alClic} />);
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(alClic).toHaveBeenCalledTimes(1);
  });

  it('no ejecuta onClick cuando está deshabilitado', () => {
    const alClic = jasmine.createSpy('alClic');
    render(<Boton etiqueta="Guardar" onClick={alClic} deshabilitado />);
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(alClic).not.toHaveBeenCalled();
  });

  it('aplica la variante y el tamaño como clases de Bootstrap', () => {
    render(<Boton etiqueta="Borrar" variante="danger" tamano="sm" />);
    const boton = screen.getByRole('button', { name: 'Borrar' });
    expect(boton.classList.contains('btn-danger')).toBeTrue();
    expect(boton.classList.contains('btn-sm')).toBeTrue();
  });
});
