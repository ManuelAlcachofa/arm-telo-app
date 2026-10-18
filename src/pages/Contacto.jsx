import { useState } from 'react';
import Alerta from '../components/Alerta.jsx';
import Boton from '../components/Boton.jsx';
import CampoFormulario from '../components/CampoFormulario.jsx';
import Pagina from '../components/Pagina.jsx';
import { crear } from '../data/db.js';
import { sinErrores, validarEmail, validarRequerido } from '../utils/validaciones.js';

const VACIO = { nombre: '', correo: '', asunto: '', mensaje: '' };

export default function Contacto() {
  const [datos, setDatos] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [enviado, setEnviado] = useState(false);

  const cambiar = (campo) => (e) => {
    setEnviado(false);
    setDatos((d) => ({ ...d, [campo]: e.target.value }));
  };

  const enviar = (evento) => {
    evento.preventDefault();
    const nuevos = {
      nombre: validarRequerido(datos.nombre, 'el nombre'),
      correo: validarEmail(datos.correo),
      asunto: validarRequerido(datos.asunto, 'el asunto'),
      mensaje: validarRequerido(datos.mensaje, 'el mensaje'),
    };
    setErrores(nuevos);
    if (!sinErrores(nuevos)) return;
    crear('mensajes', { ...datos, fecha: new Date().toISOString() });
    setDatos(VACIO);
    setEnviado(true);
  };

  return (
    <Pagina titulo="Contacto" subtitulo="Escríbenos y te responderemos a la brevedad." ancho="contenedor-formulario">
      <Alerta tipo="success" mensaje={enviado ? '¡Gracias! Recibimos tu mensaje.' : ''} />
      <form onSubmit={enviar} noValidate className="card p-4">
        <CampoFormulario id="nombre" etiqueta="Nombre" requerido valor={datos.nombre} onChange={cambiar('nombre')} error={errores.nombre} />
        <CampoFormulario id="correo" etiqueta="Correo electrónico" tipo="email" requerido valor={datos.correo} onChange={cambiar('correo')} error={errores.correo} />
        <CampoFormulario id="asunto" etiqueta="Asunto" requerido valor={datos.asunto} onChange={cambiar('asunto')} error={errores.asunto} />
        <CampoFormulario id="mensaje" etiqueta="Mensaje" tipo="textarea" requerido rows={5} valor={datos.mensaje} onChange={cambiar('mensaje')} error={errores.mensaje} />
        <Boton etiqueta="Enviar mensaje" tipo="submit" />
      </form>
    </Pagina>
  );
}
