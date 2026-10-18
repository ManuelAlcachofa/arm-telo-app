import { formatoCLP } from '../utils/formato.js';
import { enOferta, precioFinal } from '../utils/productos.js';

/** Precio actual del producto; si está en oferta muestra también el precio normal tachado. */
export default function PrecioProducto({ producto, grande = false }) {
  const oferta = enOferta(producto);
  return (
    <div className={`precio-producto ${grande ? 'precio-producto--grande' : ''}`}>
      <span className="precio-actual">{formatoCLP(precioFinal(producto))}</span>
      {oferta && (
        <>
          <s className="precio-anterior ms-2">{formatoCLP(producto.precio)}</s>
          <span className="badge text-bg-warning ms-2">Oferta</span>
        </>
      )}
    </div>
  );
}
