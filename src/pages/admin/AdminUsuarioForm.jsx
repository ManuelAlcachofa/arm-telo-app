import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Alerta from '../../components/Alerta.jsx';
import Boton from '../../components/Boton.jsx';
import CampoFormulario from '../../components/CampoFormulario.jsx';
import EstadoVacio from '../../components/EstadoVacio.jsx';
import { actualizar, crear, listar, obtener } from '../../data/db.js';
import { sinErrores, validarEmail, validarPassword, validarRequerido } from '../../utils/validaciones.js';

export function validarUsuario(d, { editando }) {
  return {
    nombre: validarRequerido(d.nombre, 'el nombre'),
    apellidos: validarRequerido(d.apellidos, 'los apellidos'),
    correo: validarEmail(d.correo),
    // Al editar, la contraseña solo se valida si se escribió una nueva.
    password: editando && !d.password ? '' : validarPassword(d.password),
  };
}

export default function AdminUsuarioForm() {
  const { id } = useParams();
  const navegar = useNavigate();
  const existente = id ? obtener('usuarios', id) : null;
  const [datos, setDatos] = useState(
    existente ? { ...existente, password: '' } : { nombre: '', apellidos: '', correo: '', password: '', rol: 'cliente' },
  );
  const [errores, setErrores] = useState({});
  const [aviso, setAviso] = useState('');

  if (id && !existente) {
    return (
      <EstadoVacio icono="bi-person-x" titulo="No encontramos ese usuario">
        <Link to="/admin/usuarios" className="btn btn-primary">
          Volver a usuarios
        </Link>
      </EstadoVacio>
    );
  }

  const cambiar = (campo) => (e) => setDatos((d) => ({ ...d, [campo]: e.target.value }));

  const guardar = (evento) => {
    evento.preventDefault();
    const nuevos = validarUsuario(datos, { editando: Boolean(existente) });
    setErrores(nuevos);
    setAviso('');
    if (!sinErrores(nuevos)) return;

    const correo = datos.correo.trim().toLowerCase();
    const repetido = listar('usuarios').some((u) => u.correo.toLowerCase() === correo && u.id !== existente?.id);
    if (repetido) {
      setAviso('Ya existe una cuenta con ese correo.');
      return;
    }

    const registro = { nombre: datos.nombre.trim(), apellidos: datos.apellidos.trim(), correo, rol: datos.rol };
    if (datos.password) registro.password = datos.password;
    if (existente) actualizar('usuarios', existente.id, registro);
    else crear('usuarios', { telefono: '', region: '', comuna: '', calle: '', departamento: '', ...registro });
    navegar('/admin/usuarios');
  };

  return (
    <>
      <Link to="/admin/usuarios" className="small">
        ← Volver a usuarios
      </Link>
      <h1 className="h3 mt-2 mb-3">{existente ? 'Editar usuario' : 'Nuevo usuario'}</h1>
      <Alerta mensaje={aviso} />
      <form onSubmit={guardar} noValidate className="card p-3 p-md-4 contenedor-formulario ms-0">
        <CampoFormulario id="nombre" etiqueta="Nombre" requerido valor={datos.nombre} onChange={cambiar('nombre')} error={errores.nombre} />
        <CampoFormulario id="apellidos" etiqueta="Apellidos" requerido valor={datos.apellidos} onChange={cambiar('apellidos')} error={errores.apellidos} />
        <CampoFormulario id="correo" etiqueta="Correo electrónico" tipo="email" requerido valor={datos.correo} onChange={cambiar('correo')} error={errores.correo} />
        <CampoFormulario
          id="password"
          etiqueta={existente ? 'Nueva contraseña (opcional)' : 'Contraseña'}
          tipo="password"
          requerido={!existente}
          autoComplete="new-password"
          valor={datos.password}
          onChange={cambiar('password')}
          error={errores.password}
          ayuda={existente ? 'Déjalo en blanco para mantener la actual.' : 'Mínimo 8 caracteres.'}
        />
        <CampoFormulario
          id="rol"
          etiqueta="Rol"
          tipo="select"
          valor={datos.rol}
          onChange={cambiar('rol')}
          opciones={[
            { valor: 'cliente', etiqueta: 'Cliente' },
            { valor: 'admin', etiqueta: 'Administrador' },
          ]}
        />
        <div className="d-flex gap-2">
          <Boton etiqueta={existente ? 'Guardar cambios' : 'Crear usuario'} tipo="submit" />
          <Link to="/admin/usuarios" className="btn btn-outline-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}
