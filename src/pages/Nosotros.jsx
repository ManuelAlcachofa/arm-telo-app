import { Link } from 'react-router-dom';
import Pagina from '../components/Pagina.jsx';

const VALORES = [
  { icono: 'bi-shield-check', titulo: 'Confianza', texto: 'Información clara de cada producto, con su precio y su stock a la vista.' },
  { icono: 'bi-lightning-charge', titulo: 'Rapidez', texto: 'Una compra simple: eliges, pagas y recibes tu boleta al instante.' },
  { icono: 'bi-chat-heart', titulo: 'Cercanía', texto: 'Te ayudamos a elegir lo que realmente necesitas, sin tecnicismos innecesarios.' },
];

export default function Nosotros() {
  return (
    <Pagina titulo="Nosotros" subtitulo="Tecnología para tu computador, explicada de forma simple.">
      <div className="row g-4 align-items-center mb-5">
        <div className="col-md-7">
          <p>
            Armatelo es una tienda online de componentes y equipos de computación. Nació como un proyecto académico de la carrera de
            Ingeniería en Informática de DUOC UC, con la idea de ofrecer una experiencia de compra ordenada, transparente y fácil de usar.
          </p>
          <p>
            Aquí encuentras procesadores, tarjetas de video, memoria RAM, almacenamiento y periféricos, organizados por categorías y con
            ofertas que se actualizan constantemente.
          </p>
          <Link to="/productos" className="btn btn-primary">
            Ver productos
          </Link>
        </div>
        <div className="col-md-5">
          <div className="card p-4 text-center">
            <i className="bi bi-pc-display display-1 text-ember" aria-hidden="true" />
            <p className="mb-0 mt-2 text-secondary">Hecho con React y Bootstrap</p>
          </div>
        </div>
      </div>

      <h2 className="h4 titulo-seccion mb-3">Lo que nos mueve</h2>
      <div className="row row-cols-1 row-cols-md-3 g-3">
        {VALORES.map((v) => (
          <div className="col" key={v.titulo}>
            <div className="card h-100 p-3">
              <i className={`bi ${v.icono} fs-2 text-ember`} aria-hidden="true" />
              <h3 className="h6 mt-2">{v.titulo}</h3>
              <p className="text-secondary mb-0">{v.texto}</p>
            </div>
          </div>
        ))}
      </div>
    </Pagina>
  );
}
