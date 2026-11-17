import { fireEvent, screen } from '@testing-library/react';
import { esperarQue, limpiarTodo, renderizarConApp } from '../test/ayudas.jsx';
import { usuariosEnServidor } from '../test/servidorFalso.js';
import Registro from './Registro.jsx';

function escribir(etiqueta, valor) {
  fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
}

describe('<Registro />', () => {
  beforeEach(() => {
    limpiarTodo();
    renderizarConApp(<Registro />);
  });

  it('guarda en el estado lo que la persona escribe', () => {
    escribir(/^Nombre/, 'Ana');
    expect(screen.getByLabelText(/^Nombre/).value).toBe('Ana');
  });

  it('muestra errores si se envía el formulario vacío y no crea el usuario', () => {
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(screen.getByText('Ingresa el nombre.')).toBeTruthy();
    expect(screen.getByText('Ingresa tu correo electrónico.')).toBeTruthy();
    expect(usuariosEnServidor().length).toBe(1); // solo el administrador inicial
  });

  it('avisa cuando las contraseñas no coinciden', () => {
    escribir(/^Nombre/, 'Ana');
    escribir(/^Apellidos/, 'Rojas');
    escribir(/^Correo/, 'ana@correo.cl');
    escribir(/^Contraseña/, 'clave1234');
    escribir(/^Confirmar/, 'otraclave1');
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(screen.getByText('Las contraseñas no coinciden.')).toBeTruthy();
  });

  it('crea la cuenta como cliente y deja la sesión iniciada cuando los datos son válidos', async () => {
    escribir(/^Nombre/, 'Ana');
    escribir(/^Apellidos/, 'Rojas');
    escribir(/^Correo/, 'ANA@correo.cl');
    escribir(/^Contraseña/, 'clave1234');
    escribir(/^Confirmar/, 'clave1234');
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await esperarQue(() => window.localStorage.getItem('armatelo:sesion') !== null);
    const creado = usuariosEnServidor().find((u) => u.correo === 'ana@correo.cl');
    expect(creado.rol).toBe('cliente');
    expect(JSON.parse(window.localStorage.getItem('armatelo:sesion')).usuario.id).toBe(creado.id);
  });

  it('no permite registrar dos veces el mismo correo', async () => {
    escribir(/^Nombre/, 'Admin');
    escribir(/^Apellidos/, 'Falso');
    escribir(/^Correo/, 'admin@armatelo.cl');
    escribir(/^Contraseña/, 'clave1234');
    escribir(/^Confirmar/, 'clave1234');
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(await screen.findByText('Ya existe una cuenta con ese correo.')).toBeTruthy();
  });
});
