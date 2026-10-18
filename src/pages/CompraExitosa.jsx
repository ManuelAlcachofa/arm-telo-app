import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Alerta from '../components/Alerta.jsx';
import Boton from '../components/Boton.jsx';
import EstadoVacio from '../components/EstadoVacio.jsx';
import Pagina from '../components/Pagina.jsx';
import ResumenOrden from '../components/ResumenOrden.jsx';
import { useColeccion } from '../data/useColeccion.js';
import { codigoOrden } from '../services/compras.js';
import { formatoFecha } from '../utils/formato.js';

export default function CompraExitosa() {
  const { id } = useParams();
  const ordenes = useColeccion('ordenes');
  const [enviada, setEnviada] = useState(false);
  const orden = ordenes.find((o) => String(o.id) === String(id));

  if (!orden || orden.estado !== 'pagada') {
    return (
      <Pagina>
        <EstadoVacio icono="bi-receipt" titulo="No encontramos esa compra">
          <Link to="/" className="btn btn-primary">
            Volver al inicio
          </Link>
        </EstadoVacio>
      </Pagina>
    );
  }

  return (
    <Pagina ancho="contenedor-angosto">
      <div className="card p-3 p-md-4" id="boleta">
        <div className="d-flex flex-column flex-sm-row justify-content-between gap-2">
          <h1 className="h3 text-success">
            <i className="bi bi-check-circle me-2" aria-hidden="true" />
            Se ha realizado la compra. nro #{orden.numero}
          </h1>
          <small className="text-secondary text-sm-end">
            Código orden: {codigoOrden(orden)}
            <br />
            Fecha: {formatoFecha(orden.fecha)}
          </small>
        </div>
        <ResumenOrden orden={orden} rotuloTotal="Total pagado" />
        <div className="d-flex flex-wrap justify-content-center gap-2 mt-3 no-imprimir">
          <Boton etiqueta="Imprimir boleta en PDF" variante="danger" tamano="sm" onClick={() => window.print()} />
          <Boton etiqueta="Enviar boleta por email" variante="success" tamano="sm" onClick={() => setEnviada(true)} />
          <Link to="/productos" className="btn btn-outline-secondary btn-sm">
            Seguir comprando
          </Link>
        </div>
        <div className="mt-3 no-imprimir">
          <Alerta tipo="success" mensaje={enviada ? `Enviamos la boleta a ${orden.cliente.correo} (simulación).` : ''} />
        </div>
      </div>
    </Pagina>
  );
}
