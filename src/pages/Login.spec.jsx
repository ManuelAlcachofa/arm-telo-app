import { fireEvent, screen } from '@testing-library/react';
import { esperarQue, limpiarTodo, renderizarConApp } from '../test/ayudas.jsx';
import Login from './Login.jsx';

function ingresar(correo, password) {
  fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: correo } });
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
}

const sesionGuardada = () => JSON.parse(window.localStorage.getItem('armatelo:sesion'));

describe('<Login />', () => {
  beforeEach(() => {
    limpiarTodo();
    renderizarConApp(<Login />);
  });

  it('muestra un error cuando las credenciales son incorrectas', async () => {
    ingresar('admin@armatelo.cl', 'incorrecta1');
    expect(await screen.findByText('Correo o contraseña incorrectos.')).toBeTruthy();
    expect(window.localStorage.getItem('armatelo:sesion')).toBeNull();
  });

  it('inicia sesión con las credenciales del administrador y guarda el token JWT', async () => {
    ingresar('admin@armatelo.cl', 'Admin1234');
    await esperarQue(() => sesionGuardada() !== null);
    expect(sesionGuardada().token).toBeTruthy();
    expect(sesionGuardada().usuario.rol).toBe('admin');
  });

  it('valida el formato del correo antes de intentar entrar', () => {
    ingresar('no-es-correo', 'algo');
    expect(screen.getByText('Ingresa un correo válido.')).toBeTruthy();
  });
});
