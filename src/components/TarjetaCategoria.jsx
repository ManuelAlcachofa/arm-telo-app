import { Link } from 'react-router-dom';

/** Tarjeta de una categoría; `activa` la resalta cuando es la que se está viendo. */
export default function TarjetaCategoria({ categoria, activa = false }) {
  return (
    <Link
      to={`/categorias/${categoria.id}`}
      className={`card tarjeta-categoria h-100 text-center text-decoration-none ${activa ? 'activa' : ''}`}
      aria-current={activa ? 'page' : undefined}
    >
      <div className="card-body">
        <i className={`bi ${categoria.icono || 'bi-tag'} display-6 text-ember`} aria-hidden="true" />
        <h3 className="h6 mt-2 mb-1">{categoria.nombre}</h3>
        {categoria.descripcion && <small className="text-secondary">{categoria.descripcion}</small>}
      </div>
    </Link>
  );
}
