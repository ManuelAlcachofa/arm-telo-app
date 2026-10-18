import { Link, useParams } from 'react-router-dom';
import EstadoVacio from '../components/EstadoVacio.jsx';
import ListaProductos from '../components/ListaProductos.jsx';
import Pagina from '../components/Pagina.jsx';
import TarjetaCategoria from '../components/TarjetaCategoria.jsx';
import { useCarrito } from '../context/CarritoContext.jsx';
import { useColeccion } from '../data/useColeccion.js';

/** Vista /categorias y /categorias/:id. Arriba las categorías; abajo los productos de la elegida. */
export default function Categorias() {
  const { id } = useParams();
  const categorias = useColeccion('categorias');
  const productos = useColeccion('productos');
  const { agregar } = useCarrito();

  const elegida = id ? categorias.find((c) => String(c.id) === String(id)) : null;
  const delaCategoria = elegida ? productos.filter((p) => String(p.categoriaId) === String(elegida.id)) : [];

  return (
    <Pagina titulo="Categorías" subtitulo="Encuentra lo que buscas según el tipo de producto.">
      <div className="row row-cols-2 row-cols-md-4 g-3 mb-5">
        {categorias.map((c) => (
          <div className="col" key={c.id}>
            <TarjetaCategoria categoria={c} activa={elegida?.id === c.id} />
          </div>
        ))}
      </div>

      {id && !elegida && (
        <EstadoVacio icono="bi-tag" titulo="Esa categoría no existe">
          <Link to="/categorias" className="btn btn-primary">
            Ver todas las categorías
          </Link>
        </EstadoVacio>
      )}

      {!id && <p className="text-secondary">Selecciona una categoría para ver sus productos.</p>}

      {elegida && (
        <section aria-labelledby="titulo-categoria">
          <h2 id="titulo-categoria" className="h4 titulo-seccion mb-3">
            {elegida.nombre}
          </h2>
          <ListaProductos
            productos={delaCategoria}
            categorias={categorias}
            onAgregar={agregar}
            mensajeVacio="Todavía no hay productos en esta categoría."
          />
        </section>
      )}
    </Pagina>
  );
}
