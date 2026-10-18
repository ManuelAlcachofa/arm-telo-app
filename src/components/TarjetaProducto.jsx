import { Link } from 'react-router-dom';
import { textoStock, tieneStock } from '../utils/productos.js';
import Boton from './Boton.jsx';
import ImagenProducto from './ImagenProducto.jsx';
import PrecioProducto from './PrecioProducto.jsx';

/** Tarjeta de un producto con su precio, stock y botón para añadirlo al carrito. */
export default function TarjetaProducto({ producto, categoria, onAgregar }) {
  const disponible = tieneStock(producto);
  return (
    <article className="card tarjeta-producto h-100">
      <Link to={`/productos/${producto.id}`} aria-label={`Ver detalle de ${producto.nombre}`}>
        <ImagenProducto producto={producto} />
      </Link>
      <div className="card-body d-flex flex-column gap-1">
        {categoria && <span className="etiqueta-categoria">{categoria}</span>}
        <h3 className="h6 card-title mb-0">
          <Link to={`/productos/${producto.id}`} className="text-reset text-decoration-none">
            {producto.nombre}
          </Link>
        </h3>
        {producto.marca && <small className="text-secondary">{producto.marca}</small>}
        <PrecioProducto producto={producto} />
        <small className={disponible ? 'text-success' : 'text-warning'}>{textoStock(producto)}</small>
        <Boton
          etiqueta={disponible ? 'Añadir' : 'Sin stock'}
          icono={disponible ? 'bi-cart-plus' : undefined}
          deshabilitado={!disponible}
          onClick={() => onAgregar(producto)}
          className="mt-auto"
          tamano="sm"
        />
      </div>
    </article>
  );
}
