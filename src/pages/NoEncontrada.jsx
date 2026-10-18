import { Link } from 'react-router-dom';
import EstadoVacio from '../components/EstadoVacio.jsx';
import Pagina from '../components/Pagina.jsx';

export default function NoEncontrada() {
  return (
    <Pagina>
      <EstadoVacio icono="bi-compass" titulo="Página no encontrada" texto="La dirección que buscas no existe.">
        <Link to="/" className="btn btn-primary">
          Volver al inicio
        </Link>
      </EstadoVacio>
    </Pagina>
  );
}
