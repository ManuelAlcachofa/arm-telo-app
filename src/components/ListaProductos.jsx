import EstadoVacio from './EstadoVacio.jsx';
import TarjetaProducto from './TarjetaProducto.jsx';

/** Grilla responsiva de productos (1 a 4 columnas según el ancho de pantalla). */
export default function ListaProductos({
  productos,
  categorias = [],
  onAgregar,
  mensajeVacio = 'Aún no hay productos disponibles.',
}) {
  if (productos.length === 0) {
    return <EstadoVacio icono="bi-box-seam" titulo={mensajeVacio} />;
  }
  return (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-3">
      {productos.map((p) => (
        <div className="col" key={p.id}>
          <TarjetaProducto
            producto={p}
            categoria={categorias.find((c) => String(c.id) === String(p.categoriaId))?.nombre}
            onAgregar={onAgregar}
          />
        </div>
      ))}
    </div>
  );
}
