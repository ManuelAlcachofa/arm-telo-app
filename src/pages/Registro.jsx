import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alerta from '../components/Alerta.jsx';
import Boton from '../components/Boton.jsx';
import CampoFormulario from '../components/CampoFormulario.jsx';
import Pagina from '../components/Pagina.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  sinErrores,
  validarConfirmacion,
  validarEmail,
  validarPassword,
  validarRequerido,
} from '../utils/validaciones.js';

const VACIO = { nombre: '', apellidos: '', correo: '', password: '', confirmar: '' };

export function validarRegistro(datos) {
  return {
    nombre: validarRequerido(datos.nombre, 'el nombre'),
    apellidos: validarRequerido(datos.apellidos, 'los apellidos'),
    correo: validarEmail(datos.correo),
    password: validarPassword(datos.password),
    confirmar: validarConfirmacion(datos.password, datos.confirmar),
  };
}

export default function Registro() {
  const { registrar } = useAuth();
  const navegar = useNavigate();
  const [datos, setDatos] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [aviso, setAviso] = useState('');

  const cambiar = (campo) => (e) => {
    const siguiente = { ...datos, [campo]: e.target.value };
    setDatos(siguiente);
    // Una vez que apareció un error en el campo, se revalida mientras la persona escribe.
    if (errores[campo] || (campo === 'password' && errores.confirmar)) {
      const todos = validarRegistro(siguiente);
      setErrores((e2) => ({ ...e2, [campo]: todos[campo], ...(campo === 'password' && datos.confirmar ? { confirmar: todos.confirmar } : {}) }));
    }
  };

  const alSalir = (campo) => () => setErrores((e) => ({ ...e, [campo]: validarRegistro(datos)[campo] }));

  const enviar = (evento) => {
    evento.preventDefault();
    const nuevos = validarRegistro(datos);
    setErrores(nuevos);
    setAviso('');
    if (!sinErrores(nuevos)) return;

    const { confirmar, ...registro } = datos;
    const resultado = registrar({ ...registro, nombre: registro.nombre.trim(), apellidos: registro.apellidos.trim() });
    if (!resultado.ok) {
      setAviso(resultado.error);
      return;
    }
    navegar('/', { replace: true });
  };

  return (
    <Pagina ancho="contenedor-formulario">
      <div className="card p-4">
        <p className="eyebrow mb-1">Cuenta nueva</p>
        <h1 className="h3">Crea tu cuenta</h1>
        <p className="text-secondary">Guarda tus datos y compra más rápido.</p>
        <Alerta mensaje={aviso} />
        <form onSubmit={enviar} noValidate>
          <CampoFormulario id="nombre" etiqueta="Nombre" requerido autoComplete="given-name" valor={datos.nombre} onChange={cambiar('nombre')} onBlur={alSalir('nombre')} error={errores.nombre} />
          <CampoFormulario id="apellidos" etiqueta="Apellidos" requerido autoComplete="family-name" valor={datos.apellidos} onChange={cambiar('apellidos')} onBlur={alSalir('apellidos')} error={errores.apellidos} />
          <CampoFormulario id="correo" etiqueta="Correo electrónico" tipo="email" requerido autoComplete="email" valor={datos.correo} onChange={cambiar('correo')} onBlur={alSalir('correo')} error={errores.correo} />
          <CampoFormulario id="password" etiqueta="Contraseña" tipo="password" requerido autoComplete="new-password" valor={datos.password} onChange={cambiar('password')} onBlur={alSalir('password')} error={errores.password} ayuda="Mínimo 8 caracteres." />
          <CampoFormulario id="confirmar" etiqueta="Confirmar contraseña" tipo="password" requerido autoComplete="new-password" valor={datos.confirmar} onChange={cambiar('confirmar')} onBlur={alSalir('confirmar')} error={errores.confirmar} />
          <Boton etiqueta="Crear cuenta" tipo="submit" className="w-100" />
        </form>
        <p className="text-center text-secondary mt-3 mb-0">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </Pagina>
  );
}
