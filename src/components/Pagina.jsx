/** Contenedor estándar de una página: título, subtítulo opcional y contenido. */
export default function Pagina({ titulo, subtitulo, children, ancho = '' }) {
  return (
    <div className={`container py-4 py-md-5 ${ancho}`}>
      {titulo && (
        <header className="mb-4">
          <h1 className="h2 titulo-seccion">{titulo}</h1>
          {subtitulo && <p className="text-secondary mb-0">{subtitulo}</p>}
        </header>
      )}
      {children}
    </div>
  );
}
