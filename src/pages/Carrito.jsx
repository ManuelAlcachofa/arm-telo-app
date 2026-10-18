import { Link } from 'react-router-dom';
import Boton from '../components/Boton.jsx';
import EstadoVacio from '../components/EstadoVacio.jsx';
import Pagina from '../components/Pagina.jsx';
import TablaItems from '../components/TablaItems.jsx';
import { useCarrito } from '../context/CarritoContext.jsx';
import { formatoCLP } from '../utils/formato.js';
import { precioFinal, stockNumerico } from '../utils/productos.js';

export default function Carrito() {
  const { items, total, cambiarCantidad, quitar, vaciar } = useCarrito();

  if (items.length === 0) {
    return (
      <Pagina titulo="Carrito de compras">
        <EstadoVacio icono="bi-cart-x" titulo="Tu carrito está vacío" texto="Agrega productos para continuar con tu compra.">
          <Link to="/productos" className="btn btn-primary">
            Ver productos
          </Link>
        </EstadoVacio>
      </Pagina>
    );
  }

  const filas = items.map(({ producto, cantidad }) => ({
    id: producto.id,
    nombre: producto.nombre,
    imagen: producto.imagen,
    precio: precioFinal(producto),
    cantidad,
    max: stockNumerico(producto),
  }));
  const buscar = (id) => items.find((i) => i.producto.id === id).producto;

  return (
    <Pagina titulo="Carrito de compras">
      <TablaItems
        filas={filas}
        editable
        onCambiar={(id, cantidad) => cambiarCantidad(buscar(id), cantidad)}
        onQuitar={(id) => quitar(buscar(id))}
      />
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mt-3">
        <Boton etiqueta="Vaciar carrito" variante="outline-secondary" onClick={vaciar} />
        <div className="text-sm-end">
          <p className="fs-5 mb-2">
            Total: <strong className="text-ember">{formatoCLP(total)}</strong>
          </p>
          <Link to="/checkout" className="btn btn-primary">
            Comprar ahora
          </Link>
        </div>
      </div>
    </Pagina>
  );
}
