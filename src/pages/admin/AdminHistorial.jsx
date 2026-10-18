import { Link, useParams } from 'react-router-dom';
import EstadoOrden from '../../components/EstadoOrden.jsx';
import EstadoVacio from '../../components/EstadoVacio.jsx';
import { obtener } from '../../data/db.js';
import { useColeccion } from '../../data/useColeccion.js';
import { formatoCLP, formatoFecha } from '../../utils/formato.js';
import { ordenesDeUsuario } from '../Perfil.jsx';

export default function AdminHistorial() {
  const { id } = useParams();
  const ordenes = useColeccion('ordenes');
  const usuario = obtener('usuarios', id);

  if (!usuario) {
    return (
      <EstadoVacio icono="bi-person-x" titulo="No encontramos ese usuario">
        <Link to="/admin/usuarios" className="btn btn-primary">
          Volver a usuarios
        </Link>
      </EstadoVacio>
    );
  }

  const compras = ordenesDeUsuario(ordenes, usuario);

  return (
    <>
      <Link to="/admin/usuarios" className="small">
        ← Volver a usuarios
      </Link>
      <h1 className="h3 mt-2">Historial de compras</h1>
      <p className="text-secondary">
        {usuario.nombre} {usuario.apellidos} · {usuario.correo}
      </p>
      {compras.length === 0 ? (
        <EstadoVacio icono="bi-bag" titulo="Esta persona aún no tiene compras" />
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th scope="col">N°</th>
                <th scope="col">Fecha</th>
                <th scope="col">Total</th>
                <th scope="col">Estado</th>
                <th scope="col">Boleta</th>
              </tr>
            </thead>
            <tbody>
              {compras.map((o) => (
                <tr key={o.id}>
                  <td>#{o.numero}</td>
                  <td>{formatoFecha(o.fecha)}</td>
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
