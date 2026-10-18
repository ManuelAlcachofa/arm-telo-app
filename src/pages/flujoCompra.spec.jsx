import { fireEvent, screen, waitFor } from '@testing-library/react';
import App from '../App.jsx';
import { obtener } from '../data/db.js';
import { crearProducto, limpiarTodo, renderizarConApp } from '../test/ayudas.jsx';

function llenarDatosCliente() {
  fireEvent.change(screen.getByLabelText(/^Nombre/), { target: { value: 'Pedro' } });
  fireEvent.change(screen.getByLabelText(/^Apellidos/), { target: { value: 'Soto' } });
  fireEvent.change(screen.getByLabelText(/^Correo/), { target: { value: 'pedro@correo.cl' } });
  fireEvent.click(screen.getByLabelText(/Retiro en tienda/));
}

describe('Flujo de compra (integración)', () => {
  beforeEach(limpiarTodo);

  it('agregar al carrito actualiza el botón del carrito en la barra superior', () => {
    crearProducto();
    renderizarConApp(<App />, { ruta: '/productos' });
    fireEvent.click(screen.getByRole('button', { name: 'Añadir' }));
    expect(screen.getByRole('link', { name: /Carrito/ }).textContent).toContain('100.000');
  });

  it('el carrito vacío muestra un mensaje y un enlace a los productos', () => {
    renderizarConApp(<App />, { ruta: '/carrito' });
    expect(screen.getByText('Tu carrito está vacío')).toBeTruthy();
  });

  it('el checkout muestra los errores de los campos obligatorios', () => {
    const producto = crearProducto();
    window.localStorage.setItem('armatelo:carrito', JSON.stringify([{ id: producto.id, cantidad: 1 }]));
    renderizarConApp(<App />, { ruta: '/checkout' });
    fireEvent.click(screen.getByRole('button', { name: /Pagar ahora/ }));
    expect(screen.getByText('Ingresa el nombre.')).toBeTruthy();
    expect(screen.getByText('Ingresa la calle.')).toBeTruthy();
  });

  it('un pago aprobado muestra la compra exitosa, vacía el carrito y descuenta el stock', async () => {
    const producto = crearProducto({ stock: 5 });
    window.localStorage.setItem('armatelo:carrito', JSON.stringify([{ id: producto.id, cantidad: 2 }]));
    renderizarConApp(<App />, { ruta: '/checkout' });
    llenarDatosCliente();
    fireEvent.click(screen.getByRole('button', { name: /Pagar ahora/ }));

    expect(await screen.findByText(/Se ha realizado la compra/, {}, { timeout: 4000 })).toBeTruthy();
    expect(obtener('productos', producto.id).stock).toBe(3);
    // El carrito se guarda en un efecto de React, por eso se espera a que termine de escribirse.
    await waitFor(() => expect(JSON.parse(window.localStorage.getItem('armatelo:carrito'))).toEqual([]));
  });

  it('un pago rechazado lleva a la vista de error y conserva el carrito', async () => {
    const producto = crearProducto({ stock: 5 });
    window.localStorage.setItem('armatelo:carrito', JSON.stringify([{ id: producto.id, cantidad: 1 }]));
    renderizarConApp(<App />, { ruta: '/checkout' });
    llenarDatosCliente();
    fireEvent.change(screen.getByLabelText(/Resultado del pago/), { target: { value: 'rechazado' } });
    fireEvent.click(screen.getByRole('button', { name: /Pagar ahora/ }));

    expect(await screen.findByText(/No se pudo realizar el pago/, {}, { timeout: 4000 })).toBeTruthy();
    expect(obtener('productos', producto.id).stock).toBe(5);
    expect(JSON.parse(window.localStorage.getItem('armatelo:carrito')).length).toBe(1);
  });
});
