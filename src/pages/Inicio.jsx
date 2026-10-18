import { Link } from 'react-router-dom';
import CarruselInicio from '../components/CarruselInicio.jsx';
import ListaProductos from '../components/ListaProductos.jsx';
import TarjetaCategoria from '../components/TarjetaCategoria.jsx';
import { useCarrito } from '../context/CarritoContext.jsx';
import { useColeccion } from '../data/useColeccion.js';
import { enOferta } from '../utils/productos.js';

export default function Inicio() {
  const productos = useColeccion('productos');
  const categorias = useColeccion('categorias');
  const { agregar } = useCarrito();
  const destacados = productos.slice(0, 4);
  const ofertas = productos.filter(enOferta).slice(0, 4);

  return (
    <>
      <CarruselInicio />

      <section className="container py-5" aria-labelledby="titulo-categorias">
        <h2 id="titulo-categorias" className="h3 titulo-seccion mb-4">
          Categorías
        </h2>
        <div className="row row-cols-2 row-cols-md-4 g-3">
          {categorias.map((c) => (
            <div className="col" key={c.id}>
              <TarjetaCategoria categoria={c} />
            </div>
          ))}
        </div>
      </section>

      <section className="container pb-5" aria-labelledby="titulo-destacados">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <h2 id="titulo-destacados" className="h3 titulo-seccion mb-0">
            Productos destacados
          </h2>
          <Link to="/productos">Ver todos</Link>
        </div>
        <ListaProductos
          productos={destacados}
          categorias={categorias}
          onAgregar={agregar}
          mensajeVacio="Pronto agregaremos productos a la tienda."
        />
      </section>

      {ofertas.length > 0 && (
        <section className="container pb-5" aria-labelledby="titulo-ofertas">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <h2 id="titulo-ofertas" className="h3 titulo-seccion mb-0">
              Ofertas
            </h2>
            <Link to="/ofertas">Ver todas</Link>
          </div>
          <ListaProductos productos={ofertas} categorias={categorias} onAgregar={agregar} />
        </section>
      )}
    </>
  );
}
