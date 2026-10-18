import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Boton from '../../components/Boton.jsx';
import CampoFormulario from '../../components/CampoFormulario.jsx';
import EstadoVacio from '../../components/EstadoVacio.jsx';
import { actualizar, crear, obtener } from '../../data/db.js';
import { validarRequerido } from '../../utils/validaciones.js';

const ICONOS = [
  { valor: 'bi-tag', etiqueta: 'Etiqueta' },
  { valor: 'bi-cpu', etiqueta: 'Procesador' },
  { valor: 'bi-gpu-card', etiqueta: 'Tarjeta de video' },
  { valor: 'bi-memory', etiqueta: 'Memoria' },
  { valor: 'bi-device-ssd', etiqueta: 'Almacenamiento' },
  { valor: 'bi-motherboard', etiqueta: 'Placa madre' },
  { valor: 'bi-lightning-charge', etiqueta: 'Energía' },
  { valor: 'bi-pc', etiqueta: 'Gabinete' },
  { valor: 'bi-keyboard', etiqueta: 'Periféricos' },
  { valor: 'bi-display', etiqueta: 'Monitores' },
  { valor: 'bi-headset', etiqueta: 'Audio' },
  { valor: 'bi-wifi', etiqueta: 'Redes' },
];

export default function AdminCategoriaForm() {
  const { id } = useParams();
  const navegar = useNavigate();
  const existente = id ? obtener('categorias', id) : null;
  const [datos, setDatos] = useState(existente ?? { nombre: '', descripcion: '', icono: 'bi-tag' });
  const [error, setError] = useState('');

  if (id && !existente) {
    return (
      <EstadoVacio icono="bi-tags" titulo="No encontramos esa categoría">
        <Link to="/admin/categorias" className="btn btn-primary">
          Volver a categorías
        </Link>
      </EstadoVacio>
    );
  }

  const guardar = (evento) => {
    evento.preventDefault();
    const mensaje = validarRequerido(datos.nombre, 'el nombre');
    setError(mensaje);
    if (mensaje) return;
    const registro = { nombre: datos.nombre.trim(), descripcion: datos.descripcion.trim(), icono: datos.icono };
    if (existente) actualizar('categorias', existente.id, registro);
    else crear('categorias', registro);
    navegar('/admin/categorias');
  };

  return (
    <>
      <Link to="/admin/categorias" className="small">
        ← Volver a categorías
      </Link>
      <h1 className="h3 mt-2 mb-3">{existente ? 'Editar categoría' : 'Nueva categoría'}</h1>
      <form onSubmit={guardar} noValidate className="card p-3 p-md-4 contenedor-formulario ms-0">
        <CampoFormulario id="nombre" etiqueta="Nombre" requerido valor={datos.nombre} onChange={(e) => setDatos((d) => ({ ...d, nombre: e.target.value }))} error={error} />
        <CampoFormulario id="descripcion" etiqueta="Descripción" tipo="textarea" valor={datos.descripcion ?? ''} onChange={(e) => setDatos((d) => ({ ...d, descripcion: e.target.value }))} />
        <CampoFormulario id="icono" etiqueta="Ícono" tipo="select" valor={datos.icono ?? 'bi-tag'} onChange={(e) => setDatos((d) => ({ ...d, icono: e.target.value }))} opciones={ICONOS} />
        <div className="d-flex gap-2">
          <Boton etiqueta={existente ? 'Guardar cambios' : 'Crear categoría'} tipo="submit" />
          <Link to="/admin/categorias" className="btn btn-outline-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}
