import { Link, useParams } from 'react-router-dom';
import Boton from '../../components/Boton.jsx';
import EstadoOrden from '../../components/EstadoOrden.jsx';
import EstadoVacio from '../../components/EstadoVacio.jsx';
import ResumenOrden from '../../components/ResumenOrden.jsx';
import { useColeccion } from '../../data/useColeccion.js';
import { codigoOrden } from '../../services/compras.js';
import { formatoFecha } from '../../utils/formato.js';

export default function AdminBoleta() {
  const { id } = useParams();
  const ordenes = useColeccion('ordenes');
  const orden = ordenes.find((o) => String(o.id) === String(id));

  if (!orden) {
    return (
      <EstadoVacio icono="bi-receipt" titulo="No encontramos esa orden">
        <Link to="/admin/ordenes" className="btn btn-primary">
          Volver a órdenes
        </Link>
      </EstadoVacio>
    );
  }

  return (
    <>
      <Link to="/admin/ordenes" className="small no-imprimir">
        ← Volver a órdenes
      </Link>
      <div className="card p-3 p-md-4 mt-3" id="boleta">
        <div className="d-flex flex-column flex-sm-row justify-content-between gap-2">
          <h1 className="h4">Boleta #{orden.numero}</h1>
          <div className="text-sm-end">
            <EstadoOrden estado={orden.estado} />
            <small className="d-block text-secondary mt-1">
              {codigoOrden(orden)} · {formatoFecha(orden.fecha)}
            </small>
          </div>
        </div>
        <ResumenOrden orden={orden} />
        <div className="mt-3 no-imprimir">
          <Boton etiqueta="Imprimir boleta" variante="outline-secondary" tamano="sm" onClick={() => window.print()} />
        </div>
      </div>
    </>
  );
}
