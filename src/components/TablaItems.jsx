import { formatoCLP } from '../utils/formato.js';
import Boton from './Boton.jsx';
import ImagenProducto from './ImagenProducto.jsx';

/**
 * Tabla de productos para el carrito, el checkout y la boleta.
 * filas: [{ id, nombre, precio, cantidad, max, imagen }]
 * Si `editable` es true muestra los botones para cambiar la cantidad y eliminar.
 */
export default function TablaItems({ filas, editable = false, onCambiar, onQuitar }) {
  return (
    <div className="table-responsive">
      <table className="table align-middle tabla-items">
        <thead>
          <tr>
            <th scope="col">Imagen</th>
            <th scope="col">Nombre</th>
            <th scope="col">Precio</th>
            <th scope="col">Cantidad</th>
            <th scope="col">Subtotal</th>
            {editable && <th scope="col">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => (
            <tr key={fila.id}>
              <td style={{ width: 64 }}>
                <ImagenProducto producto={{ nombre: fila.nombre, imagen: fila.imagen }} alto={48} />
              </td>
              <td>{fila.nombre}</td>
              <td>{formatoCLP(fila.precio)}</td>
              <td>
                {editable ? (
                  <div className="input-group input-group-sm cantidad-control">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      aria-label={`Disminuir cantidad de ${fila.nombre}`}
                      onClick={() => onCambiar(fila.id, fila.cantidad - 1)}
                    >
                      −
                    </button>
                    <span className="input-group-text" aria-live="polite">
                      {fila.cantidad}
                    </span>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      aria-label={`Aumentar cantidad de ${fila.nombre}`}
                      disabled={fila.cantidad >= fila.max}
                      onClick={() => onCambiar(fila.id, fila.cantidad + 1)}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  fila.cantidad
                )}
              </td>
              <td>{formatoCLP(fila.precio * fila.cantidad)}</td>
              {editable && (
                <td>
                  <Boton
                    etiqueta="Eliminar"
                    variante="danger"
                    tamano="sm"
                    aria-label={`Eliminar ${fila.nombre} del carrito`}
                    onClick={() => onQuitar(fila.id)}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
