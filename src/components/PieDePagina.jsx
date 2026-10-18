import { Link } from 'react-router-dom';

export default function PieDePagina() {
  return (
    <footer className="pie border-top mt-5 py-4">
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
        <span className="marca">
          ARMA<span>TELO</span>
        </span>
        <nav className="d-flex gap-3 small" aria-label="Enlaces del pie de página">
          <Link to="/nosotros">Nosotros</Link>
          <Link to="/blogs">Blog</Link>
          <Link to="/contacto">Contacto</Link>
        </nav>
        <small className="text-secondary">&copy; {new Date().getFullYear()} Armatelo. Proyecto académico.</small>
      </div>
    </footer>
  );
}
