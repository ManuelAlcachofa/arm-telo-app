import { useState } from 'react';
import { Link } from 'react-router-dom';
import CampoFormulario from '../../components/CampoFormulario.jsx';
import EstadoOrden from '../../components/EstadoOrden.jsx';
import EstadoVacio from '../../components/EstadoVacio.jsx';
import { useColeccion } from '../../data/useColeccion.js';
import { formatoCLP, formatoFecha } from '../../utils/formato.js';

export default function AdminOrdenes() {
  const ordenes = useColeccion('ordenes');
  const [estado, setEstado] = useState('');
  const visibles = [...ordenes].reverse().filter((o) => !estado || o.estado === estado);

  return (
    <>
      <h1 className="h3">Órdenes y boletas</h1>
      <div className="row mb-3">
        <div className="col-sm-4">
          <CampoFormulario
            id="filtro-estado"
            etiqueta="Estado"
            tipo="select"
            valor={estado}
            onChange={(e) => setEstado(e.target.value)}
            opciones={[
              { valor: '', etiqueta: 'Todas' },
              { valor: 'pagada', etiqueta: 'Pagadas' },
              { valor: 'rechazada', etiqueta: 'Rechazadas' },
              { valor: 'pendiente', etiqueta: 'Pendientes' },
            ]}
          />
        </div>
      </div>

      {visibles.length === 0 ? (
        <EstadoVacio icono="bi-receipt" titulo="Todavía no hay órdenes" texto="Aparecerán aquí cuando alguien compre en la tienda." />
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th scope="col">N°</th>
                <th scope="col">Fecha</th>
                <th scope="col">Cliente</th>
                <th scope="col">Total</th>
                <th scope="col">Estado</th>
                <th scope="col">Boleta</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((o) => (
                <tr key={o.id}>
                  <td>#{o.numero}</td>
                  <td>{formatoFecha(o.fecha)}</td>
                  <td>
                    {o.cliente.nombre} {o.cliente.apellidos}
                    <small className="d-block text-secondary">{o.cliente.correo}</small>
                  </td>
                  <td>{formatoCLP(o.total)}</td>
                  <td>
                    <EstadoOrden estado={o.estado} />
                  </td>
                  <td>
                    <Link to={`/admin/ordenes/${o.id}`} className="btn btn-outline-primary btn-sm">
                      Mostrar boleta
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
