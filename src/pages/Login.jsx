import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Alerta from '../components/Alerta.jsx';
import Boton from '../components/Boton.jsx';
import CampoFormulario from '../components/CampoFormulario.jsx';
import Pagina from '../components/Pagina.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { sinErrores, validarEmail, validarRequerido } from '../utils/validaciones.js';

export default function Login() {
  const { iniciarSesion } = useAuth();
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const [datos, setDatos] = useState({ correo: '', password: '' });
  const [errores, setErrores] = useState({});
  const [aviso, setAviso] = useState('');

  const cambiar = (campo) => (e) => setDatos((d) => ({ ...d, [campo]: e.target.value }));

  const enviar = (evento) => {
    evento.preventDefault();
    const nuevos = {
      correo: validarEmail(datos.correo),
      password: validarRequerido(datos.password, 'la contraseña'),
    };
    setErrores(nuevos);
    setAviso('');
    if (!sinErrores(nuevos)) return;

    const resultado = iniciarSesion(datos.correo, datos.password);
    if (!resultado.ok) {
      setAviso(resultado.error);
      return;
    }
    const destino = ubicacion.state?.desde ?? (resultado.usuario.rol === 'admin' ? '/admin' : '/');
    navegar(destino, { replace: true });
  };

  return (
    <Pagina ancho="contenedor-formulario">
      <div className="card p-4">
        <p className="eyebrow mb-1">Tu cuenta</p>
        <h1 className="h3 mb-3">Inicia sesión</h1>
        <Alerta mensaje={aviso} />
        <form onSubmit={enviar} noValidate>
          <CampoFormulario id="correo" etiqueta="Correo electrónico" tipo="email" autoComplete="email" valor={datos.correo} onChange={cambiar('correo')} error={errores.correo} />
          <CampoFormulario id="password" etiqueta="Contraseña" tipo="password" autoComplete="current-password" valor={datos.password} onChange={cambiar('password')} error={errores.password} />
          <Boton etiqueta="Entrar" tipo="submit" className="w-100" />
        </form>
        <p className="text-center text-secondary mt-3 mb-0">
          ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
        </p>
      </div>
    </Pagina>
  );
}
