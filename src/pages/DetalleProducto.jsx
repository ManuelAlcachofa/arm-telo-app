import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Alerta from '../components/Alerta.jsx';
import Boton from '../components/Boton.jsx';
import EstadoVacio from '../components/EstadoVacio.jsx';
import ImagenProducto from '../components/ImagenProducto.jsx';
import ListaProductos from '../components/ListaProductos.jsx';
import Pagina from '../components/Pagina.jsx';
import PrecioProducto from '../components/PrecioProducto.jsx';
import { useCarrito } from '../context/CarritoContext.jsx';
import { useColeccion } from '../data/useColeccion.js';
import { stockNumerico, textoStock, tieneStock } from '../utils/productos.js';

export default function DetalleProducto() {
  const { id } = useParams();
  const productos = useColeccion('productos');
  const categorias = useColeccion('categorias');
  const { agregar } = useCarrito();
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  const producto = productos.find((p) => String(p.id) === String(id));

  if (!producto) {
    return (
      <Pagina>
        <EstadoVacio icono="bi-search" titulo="No encontramos este producto" texto="Puede que ya no esté disponible.">
          <Link to="/productos" className="btn btn-primary">
            Volver a productos
          </Link>
        </EstadoVacio>
      </Pagina>
    );
  }

  const categoria = categorias.find((c) => String(c.id) === String(producto.categoriaId));
  const maximo = stockNumerico(producto);
  const relacionados = productos.filter((p) => p.id !== producto.id && p.categoriaId === producto.categoriaId).slice(0, 4);

  const anadir = () => {
    agregar(producto, cantidad);
    setAgregado(true);
  };

  return (
    <Pagina>
      <nav aria-label="Ruta de navegación" className="small mb-3">
        <Link to="/productos">Productos</Link>
        {categoria && (
          <>
            {' / '}
            <Link to={`/categorias/${categoria.id}`}>{categoria.nombre}</Link>
          </>
        )}
      </nav>

      <div className="row g-4">
        <div className="col-md-5">
          <ImagenProducto producto={producto} alto={380} className="rounded" />
        </div>
        <div className="col-md-7">
          <h1 className="h3">{producto.nombre}</h1>
          {producto.marca && <p className="text-secondary mb-2">Marca: {producto.marca}</p>}
          <PrecioProducto producto={producto} grande />
          <p className={`mt-2 ${tieneStock(producto) ? 'text-success' : 'text-warning'}`}>{textoStock(producto)}</p>
          {producto.descripcion && <p>{producto.descripcion}</p>}

          <div className="d-flex align-items-end gap-3 mt-4">
            <div>
              <label htmlFor="cantidad" className="form-label">
                Cantidad
              </label>
              <input
                id="cantidad"
                type="number"
                className="form-control"
                style={{ width: 100 }}
                min="1"
                max={maximo}
                value={cantidad}
                disabled={!tieneStock(producto)}
                onChange={(e) => {
                  setAgregado(false);
                  setCantidad(Math.min(Math.max(1, Number(e.target.value) || 1), Math.max(1, maximo)));
                }}
              />
            </div>
            <Boton
              etiqueta={tieneStock(producto) ? 'Añadir al carrito' : 'Sin stock'}
              icono="bi-cart-plus"
              deshabilitado={!tieneStock(producto)}
              onClick={anadir}
            />
          </div>
          <div className="mt-3">
            <Alerta
              tipo="success"
              mensaje={agregado ? `Agregaste ${cantidad} ${cantidad === 1 ? 'unidad' : 'unidades'} al carrito.` : ''}
            />
            {agregado && (
              <Link to="/carrito" className="btn btn-outline-primary btn-sm">
                Ir al carrito
              </Link>
            )}
          </div>
        </div>
      </div>

      {relacionados.length > 0 && (
        <section className="mt-5" aria-labelledby="titulo-relacionados">
          <h2 id="titulo-relacionados" className="h4 titulo-seccion mb-3">
            Productos relacionados
          </h2>
          <ListaProductos productos={relacionados} categorias={categorias} onAgregar={agregar} />
        </section>
      )}
    </Pagina>
  );
}
