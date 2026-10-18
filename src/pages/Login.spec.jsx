import { fireEvent, screen } from '@testing-library/react';
import { limpiarTodo, renderizarConApp } from '../test/ayudas.jsx';
import Login from './Login.jsx';

function ingresar(correo, password) {
  fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: correo } });
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
}

describe('<Login />', () => {
  beforeEach(() => {
    limpiarTodo();
    renderizarConApp(<Login />);
  });

  it('muestra un error cuando las credenciales son incorrectas', () => {
    ingresar('admin@armatelo.cl', 'incorrecta1');
    expect(screen.getByText('Correo o contraseña incorrectos.')).toBeTruthy();
    expect(window.localStorage.getItem('armatelo:sesion')).toBeNull();
  });

  it('inicia sesión con las credenciales del administrador', () => {
    ingresar('admin@armatelo.cl', 'Admin1234');
    expect(window.localStorage.getItem('armatelo:sesion')).toBe('1');
  });

  it('valida el formato del correo antes de intentar entrar', () => {
    ingresar('no-es-correo', 'algo');
    expect(screen.getByText('Ingresa un correo válido.')).toBeTruthy();
  });
});
