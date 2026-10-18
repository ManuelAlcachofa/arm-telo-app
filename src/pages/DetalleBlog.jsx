import { Link, useParams } from 'react-router-dom';
import EstadoVacio from '../components/EstadoVacio.jsx';
import Pagina from '../components/Pagina.jsx';
import { BLOGS } from '../data/blogs.js';
import { formatoFecha } from '../utils/formato.js';

export default function DetalleBlog() {
  const { id } = useParams();
  const articulo = BLOGS.find((b) => String(b.id) === String(id));

  if (!articulo) {
    return (
      <Pagina>
        <EstadoVacio icono="bi-journal-x" titulo="No encontramos ese artículo">
          <Link to="/blogs" className="btn btn-primary">
            Volver al blog
          </Link>
        </EstadoVacio>
      </Pagina>
    );
  }

  const otro = BLOGS.find((b) => b.id !== articulo.id);

  return (
    <Pagina ancho="contenedor-angosto">
      <Link to="/blogs" className="small">
        ← Volver al blog
      </Link>
      <article className="mt-3">
        <h1 className="h2">{articulo.titulo}</h1>
        <p className="text-secondary">
          {formatoFecha(articulo.fecha)} · {articulo.autor}
        </p>
        {articulo.contenido.map((parrafo) => (
          <p key={parrafo.slice(0, 30)}>{parrafo}</p>
        ))}
      </article>
      {otro && (
        <aside className="card p-3 mt-4">
          <small className="text-secondary">Sigue leyendo</small>
          <Link to={`/blogs/${otro.id}`}>{otro.titulo}</Link>
        </aside>
      )}
    </Pagina>
  );
}
