import { fireEvent, screen } from '@testing-library/react';
import App from '../App.jsx';
import { crearProducto, esperarQue, limpiarTodo, renderizarConApp } from '../test/ayudas.jsx';
import { productoEnServidor } from '../test/servidorFalso.js';

function llenarDatosCliente() {
  fireEvent.change(screen.getByLabelText(/^Nombre/), { target: { value: 'Pedro' } });
  fireEvent.change(screen.getByLabelText(/^Apellidos/), { target: { value: 'Soto' } });
  fireEvent.change(screen.getByLabelText(/^Correo/), { target: { value: 'pedro@correo.cl' } });
  fireEvent.click(screen.getByLabelText(/Retiro en tienda/));
}

describe('Flujo de compra (integración)', () => {
  beforeEach(limpiarTodo);

  it('agregar al carrito actualiza el botón del carrito en la barra superior', async () => {
    crearProducto();
    renderizarConApp(<App />, { ruta: '/productos' });
    fireEvent.click(await screen.findByRole('button', { name: 'Añadir' }));
    expect(screen.getByRole('link', { name: /Carrito/ }).textContent).toContain('100.000');
  });

  it('el carrito vacío muestra un mensaje y un enlace a los productos', async () => {
    renderizarConApp(<App />, { ruta: '/carrito' });
    expect(await screen.findByText('Tu carrito está vacío')).toBeTruthy();
  });

  it('el checkout muestra los errores de los campos obligatorios', async () => {
    const producto = crearProducto();
    window.localStorage.setItem('armatelo:carrito', JSON.stringify([{ id: producto.id, cantidad: 1 }]));
    renderizarConApp(<App />, { ruta: '/checkout' });
    fireEvent.click(await screen.findByRole('button', { name: /Pagar ahora/ }));
    expect(screen.getByText('Ingresa el nombre.')).toBeTruthy();
    expect(screen.getByText('Ingresa la calle.')).toBeTruthy();
  });

  it('un pago aprobado muestra la compra exitosa, vacía el carrito y descuenta el stock', async () => {
    const producto = crearProducto({ stock: 5 });
    window.localStorage.setItem('armatelo:carrito', JSON.stringify([{ id: producto.id, cantidad: 2 }]));
    renderizarConApp(<App />, { ruta: '/checkout' });
    await screen.findByRole('button', { name: /Pagar ahora/ });
    llenarDatosCliente();
    fireEvent.click(screen.getByRole('button', { name: /Pagar ahora/ }));

    expect(await screen.findByText(/Se ha realizado la compra/, {}, { timeout: 4000 })).toBeTruthy();
    expect(productoEnServidor(producto.id).stock).toBe(3);
    // El carrito se guarda en un efecto de React, por eso se espera a que termine de escribirse.
    await esperarQue(() => window.localStorage.getItem('armatelo:carrito') === '[]');
  });

  it('un pago rechazado lleva a la vista de error y conserva el carrito', async () => {
    const producto = crearProducto({ stock: 5 });
    window.localStorage.setItem('armatelo:carrito', JSON.stringify([{ id: producto.id, cantidad: 1 }]));
    renderizarConApp(<App />, { ruta: '/checkout' });
    await screen.findByRole('button', { name: /Pagar ahora/ });
    llenarDatosCliente();
    fireEvent.change(screen.getByLabelText(/Resultado del pago/), { target: { value: 'rechazado' } });
    fireEvent.click(screen.getByRole('button', { name: /Pagar ahora/ }));

    expect(await screen.findByText(/No se pudo realizar el pago/, {}, { timeout: 4000 })).toBeTruthy();
    expect(productoEnServidor(producto.id).stock).toBe(5);
    expect(JSON.parse(window.localStorage.getItem('armatelo:carrito')).length).toBe(1);
  });

  it('si el backend rechaza la orden por falta de stock, el checkout muestra su mensaje', async () => {
    const producto = crearProducto({ stock: 5 });
    window.localStorage.setItem('armatelo:carrito', JSON.stringify([{ id: producto.id, cantidad: 2 }]));
    renderizarConApp(<App />, { ruta: '/checkout' });
    await screen.findByRole('button', { name: /Pagar ahora/ });
    llenarDatosCliente();
    productoEnServidor(producto.id).stock = 1; // otra persona compró mientras tanto
    fireEvent.click(screen.getByRole('button', { name: /Pagar ahora/ }));

    expect(await screen.findByText(/No hay stock suficiente de: Ryzen 5 5600/)).toBeTruthy();
  });
});
