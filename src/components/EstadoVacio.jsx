/** Mensaje para listas sin elementos. */
export default function EstadoVacio({ icono = 'bi-inbox', titulo, texto, children }) {
  return (
    <div className="estado-vacio text-center py-5 px-3">
      <i className={`bi ${icono} display-4 text-ember`} aria-hidden="true" />
      <h2 className="h5 mt-3">{titulo}</h2>
      {texto && <p className="text-secondary mb-3">{texto}</p>}
      {children}
    </div>
  );
}
