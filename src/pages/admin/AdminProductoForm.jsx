import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Boton from '../../components/Boton.jsx';
import CampoFormulario from '../../components/CampoFormulario.jsx';
import EstadoVacio from '../../components/EstadoVacio.jsx';
import { actualizar, crear, obtener } from '../../data/db.js';
import { useColeccion } from '../../data/useColeccion.js';
import { sinErrores, validarNumeroPositivo, validarRequerido } from '../../utils/validaciones.js';

export function validarProducto(d) {
  const errores = {
    nombre: validarRequerido(d.nombre, 'el nombre'),
    categoriaId: validarRequerido(d.categoriaId, 'una categoría', 'Selecciona'),
    precio: validarNumeroPositivo(d.precio, 'El precio'),
    precioOferta: '',
    stock: '',
    stockCritico: validarNumeroPositivo(d.stockCritico, 'El stock crítico'),
  };
  if (String(d.precioOferta).trim() !== '') {
    errores.precioOferta = validarNumeroPositivo(d.precioOferta, 'El precio de oferta');
    if (!errores.precioOferta && Number(d.precioOferta) >= Number(d.precio)) {
      errores.precioOferta = 'El precio de oferta debe ser menor al precio normal.';
    }
  }
  if (String(d.stock).trim() !== '') {
    errores.stock = validarNumeroPositivo(d.stock, 'El stock');
    if (!errores.stock && !Number.isInteger(Number(d.stock))) errores.stock = 'El stock debe ser un número entero.';
  }
  return errores;
}

const VACIO = {
  nombre: '',
  marca: '',
  categoriaId: '',
  descripcion: '',
  precio: '',
  precioOferta: '',
  stock: '',
  stockCritico: 5,
  imagen: '',
};

/** Formulario para crear (/admin/productos/nuevo) o editar (/admin/productos/:id/editar) un producto. */
export default function AdminProductoForm() {
  const { id } = useParams();
  const navegar = useNavigate();
  const categorias = useColeccion('categorias');
  const existente = id ? obtener('productos', id) : null;
  const [datos, setDatos] = useState(existente ? { ...VACIO, ...existente } : VACIO);
  const [errores, setErrores] = useState({});

  if (id && !existente) {
    return (
      <EstadoVacio icono="bi-box-seam" titulo="No encontramos ese producto">
        <Link to="/admin/productos" className="btn btn-primary">
          Volver a productos
        </Link>
      </EstadoVacio>
    );
  }

  const cambiar = (campo) => (e) => setDatos((d) => ({ ...d, [campo]: e.target.value }));

  const guardar = (evento) => {
    evento.preventDefault();
    const nuevos = validarProducto(datos);
    setErrores(nuevos);
    if (!sinErrores(nuevos)) return;

    const registro = {
      nombre: datos.nombre.trim(),
      marca: datos.marca.trim(),
      categoriaId: Number(datos.categoriaId),
      descripcion: datos.descripcion.trim(),
      precio: Number(datos.precio),
      precioOferta: String(datos.precioOferta).trim() === '' ? '' : Number(datos.precioOferta),
      stock: String(datos.stock).trim() === '' ? '' : Number(datos.stock),
      stockCritico: Number(datos.stockCritico),
      imagen: datos.imagen.trim(),
    };
    if (existente) actualizar('productos', existente.id, registro);
    else crear('productos', registro);
    navegar('/admin/productos');
  };

  return (
    <>
      <Link to="/admin/productos" className="small">
        ← Volver a productos
      </Link>
      <h1 className="h3 mt-2 mb-3">{existente ? 'Editar producto' : 'Nuevo producto'}</h1>
      <form onSubmit={guardar} noValidate className="card p-3 p-md-4">
        <div className="row">
          <div className="col-md-8">
            <CampoFormulario id="nombre" etiqueta="Nombre" requerido valor={datos.nombre} onChange={cambiar('nombre')} error={errores.nombre} />
          </div>
          <div className="col-md-4">
            <CampoFormulario id="marca" etiqueta="Marca" valor={datos.marca} onChange={cambiar('marca')} />
          </div>
          <div className="col-md-6">
            <CampoFormulario
              id="categoriaId"
              etiqueta="Categoría"
              tipo="select"
              requerido
              valor={String(datos.categoriaId)}
              onChange={cambiar('categoriaId')}
              error={errores.categoriaId}
              opciones={[{ valor: '', etiqueta: 'Selecciona una categoría' }, ...categorias.map((c) => ({ valor: String(c.id), etiqueta: c.nombre }))]}
            />
          </div>
          <div className="col-md-6">
            <CampoFormulario id="imagen" etiqueta="URL de la imagen (opcional)" tipo="url" valor={datos.imagen} onChange={cambiar('imagen')} />
          </div>
        </div>
        <CampoFormulario id="descripcion" etiqueta="Descripción" tipo="textarea" valor={datos.descripcion} onChange={cambiar('descripcion')} />
        <div className="row">
          <div className="col-md-3">
            <CampoFormulario id="precio" etiqueta="Precio ($)" tipo="number" min="0" requerido valor={datos.precio} onChange={cambiar('precio')} error={errores.precio} />
          </div>
          <div className="col-md-3">
            <CampoFormulario id="precioOferta" etiqueta="Precio de oferta ($)" tipo="number" min="0" valor={datos.precioOferta} onChange={cambiar('precioOferta')} error={errores.precioOferta} ayuda="Déjalo vacío si no está en oferta." />
          </div>
          <div className="col-md-3">
            <CampoFormulario id="stock" etiqueta="Stock" tipo="number" min="0" valor={datos.stock} onChange={cambiar('stock')} error={errores.stock} ayuda="Déjalo vacío si aún no lo defines." />
          </div>
          <div className="col-md-3">
            <CampoFormulario id="stockCritico" etiqueta="Stock crítico" tipo="number" min="0" requerido valor={datos.stockCritico} onChange={cambiar('stockCritico')} error={errores.stockCritico} ayuda="Se avisa cuando el stock llega a este número." />
          </div>
        </div>
        <div className="d-flex gap-2">
          <Boton etiqueta={existente ? 'Guardar cambios' : 'Crear producto'} tipo="submit" />
          <Link to="/admin/productos" className="btn btn-outline-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}
