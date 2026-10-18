/** Muestra la imagen del producto o, si no tiene, un recuadro de reemplazo. */
export default function ImagenProducto({ producto, alto = 180, className = '' }) {
  if (producto?.imagen) {
    return (
      <img
        src={producto.imagen}
        alt={producto.nombre}
        className={`imagen-producto ${className}`}
        style={{ height: alto }}
        loading="lazy"
      />
    );
  }
  return (
    <div
      className={`imagen-producto imagen-producto--vacia ${className}`}
      style={{ height: alto }}
      role="img"
      aria-label={`Sin imagen de ${producto?.nombre ?? 'producto'}`}
    >
      <i className="bi bi-cpu" aria-hidden="true" />
    </div>
  );
}
