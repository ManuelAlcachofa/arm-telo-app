import { useState } from 'react';
import { sinErrores, validarPassword, validarRequerido } from '../utils/validaciones.js';
import Alerta from './Alerta.jsx';
import Boton from './Boton.jsx';
import CampoFormulario from './CampoFormulario.jsx';
import SelectorRegionComuna from './SelectorRegionComuna.jsx';

/** Formulario para ver y editar los datos de una persona (se usa en "Mi perfil" y en el panel de administración). */
export default function PerfilForm({ usuario, onGuardar }) {
  const [datos, setDatos] = useState({
    nombre: usuario.nombre ?? '',
    apellidos: usuario.apellidos ?? '',
    telefono: usuario.telefono ?? '',
    region: usuario.region ?? '',
    comuna: usuario.comuna ?? '',
    calle: usuario.calle ?? '',
    departamento: usuario.departamento ?? '',
    nuevaPassword: '',
  });
  const [errores, setErrores] = useState({});
  const [guardado, setGuardado] = useState(false);

  const cambiar = (campo) => (e) => {
    setGuardado(false);
    setDatos((d) => ({ ...d, [campo]: e.target.value }));
  };

  const enviar = (evento) => {
    evento.preventDefault();
    const nuevos = {
      nombre: validarRequerido(datos.nombre, 'el nombre'),
      apellidos: validarRequerido(datos.apellidos, 'los apellidos'),
      nuevaPassword: datos.nuevaPassword ? validarPassword(datos.nuevaPassword) : '',
    };
    setErrores(nuevos);
    if (!sinErrores(nuevos)) return;
    const { nuevaPassword, ...resto } = datos;
    onGuardar(nuevaPassword ? { ...resto, password: nuevaPassword } : resto);
    setDatos((d) => ({ ...d, nuevaPassword: '' }));
    setGuardado(true);
  };

  return (
    <form onSubmit={enviar} noValidate>
      <Alerta tipo="success" mensaje={guardado ? 'Tus datos se guardaron correctamente.' : ''} />
      <div className="row">
        <div className="col-md-6">
          <CampoFormulario id="nombre" etiqueta="Nombre" requerido valor={datos.nombre} onChange={cambiar('nombre')} error={errores.nombre} />
        </div>
        <div className="col-md-6">
          <CampoFormulario id="apellidos" etiqueta="Apellidos" requerido valor={datos.apellidos} onChange={cambiar('apellidos')} error={errores.apellidos} />
        </div>
        <div className="col-md-6">
          <CampoFormulario id="correo" etiqueta="Correo electrónico" tipo="email" valor={usuario.correo} readOnly onChange={() => {}} ayuda="El correo no se puede modificar." />
        </div>
        <div className="col-md-6">
          <CampoFormulario id="telefono" etiqueta="Teléfono" tipo="tel" valor={datos.telefono} onChange={cambiar('telefono')} />
        </div>
      </div>
      <SelectorRegionComuna
        region={datos.region}
        comuna={datos.comuna}
        onCambiarRegion={(region) => setDatos((d) => ({ ...d, region, comuna: '' }))}
        onCambiarComuna={(comuna) => setDatos((d) => ({ ...d, comuna }))}
      />
      <div className="row">
        <div className="col-md-8">
          <CampoFormulario id="calle" etiqueta="Calle y número" valor={datos.calle} onChange={cambiar('calle')} />
        </div>
        <div className="col-md-4">
          <CampoFormulario id="departamento" etiqueta="Departamento (opcional)" valor={datos.departamento} onChange={cambiar('departamento')} />
        </div>
      </div>
      <CampoFormulario
        id="nuevaPassword"
        etiqueta="Nueva contraseña (opcional)"
        tipo="password"
        autoComplete="new-password"
        valor={datos.nuevaPassword}
        onChange={cambiar('nuevaPassword')}
        error={errores.nuevaPassword}
        ayuda="Déjalo en blanco si no quieres cambiarla."
      />
      <Boton etiqueta="Guardar cambios" tipo="submit" />
    </form>
  );
}
