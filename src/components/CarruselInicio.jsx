import { Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const DIAPOSITIVAS = [
  {
    titulo: 'Nuevos lanzamientos',
    texto: 'Descubre los últimos componentes disponibles en nuestra tienda.',
    enlace: '/productos',
    boton: 'Ver productos',
  },
  {
    titulo: 'Ofertas de la semana',
    texto: 'Productos con precio rebajado por tiempo limitado.',
    enlace: '/ofertas',
    boton: 'Ver ofertas',
  },
  {
    titulo: 'Todo para tu setup',
    texto: 'Procesadores, tarjetas de video, memoria, almacenamiento y más.',
    enlace: '/categorias',
    boton: 'Explorar categorías',
  },
];

export default function CarruselInicio() {
  return (
    <Carousel className="carrusel-inicio" interval={6000} aria-label="Destacados">
      {DIAPOSITIVAS.map((d, i) => (
        <Carousel.Item key={d.titulo}>
          <div className={`diapositiva diapositiva-${i + 1}`}>
            <div className="container text-center text-md-start">
              <p className="eyebrow">Armatelo</p>
              <h2 className="titulo-hero">{d.titulo}</h2>
              <p className="lead text-secondary">{d.texto}</p>
              <Link to={d.enlace} className="btn btn-primary">
                {d.boton}
              </Link>
            </div>
          </div>
        </Carousel.Item>
      ))}
    </Carousel>
  );
}
