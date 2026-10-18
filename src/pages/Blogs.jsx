import { Link } from 'react-router-dom';
import Pagina from '../components/Pagina.jsx';
import { BLOGS } from '../data/blogs.js';
import { formatoFecha } from '../utils/formato.js';

export default function Blogs() {
  return (
    <Pagina titulo="Blog" subtitulo="Consejos para elegir mejor tus componentes.">
      <div className="row row-cols-1 row-cols-md-2 g-4">
        {BLOGS.map((b) => (
          <div className="col" key={b.id}>
            <article className="card h-100">
              <div className="card-body">
                <i className={`bi ${b.icono} fs-1 text-ember`} aria-hidden="true" />
                <h2 className="h5 mt-2">{b.titulo}</h2>
                <p className="text-secondary">{b.resumen}</p>
                <small className="text-secondary d-block mb-3">
                  {formatoFecha(b.fecha)} · {b.autor}
                </small>
                <Link to={`/blogs/${b.id}`} className="btn btn-outline-primary btn-sm">
                  Leer artículo
                </Link>
              </div>
            </article>
          </div>
        ))}
      </div>
    </Pagina>
  );
}
