import { Link } from 'react-router-dom';
import EstadoOrden from '../components/EstadoOrden.jsx';
import EstadoVacio from '../components/EstadoVacio.jsx';
import Pagina from '../components/Pagina.jsx';
import PerfilForm from '../components/PerfilForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useColeccion } from '../data/useColeccion.js';
import { formatoCLP, formatoFecha } from '../utils/formato.js';

/** Historial de compras de una persona (por id de usuario o por correo). */
export function ordenesDeUsuario(ordenes, usuario) {
  return ordenes.filter(
    (o) => o.usuarioId === usuario.id || o.cliente.correo.toLowerCase() === usuario.correo.toLowerCase(),
  );
}

export default function Perfil() {
  const { usuario, actualizarPerfil } = useAuth();
  const ordenes = useColeccion('ordenes');
  const mias = ordenesDeUsuario(ordenes, usuario);

  return (
    <Pagina titulo="Mi perfil" subtitulo={usuario.correo}>
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card p-3 p-md-4">
            <h2 className="h5 mb-3">Mis datos</h2>
            <PerfilForm usuario={usuario} onGuardar={actualizarPerfil} />
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card p-3 p-md-4">
            <h2 className="h5 mb-3">Mis compras</h2>
            {mias.length === 0 ? (
              <EstadoVacio icono="bi-bag" titulo="Aún no tienes compras">
                <Link to="/productos" className="btn btn-primary btn-sm">
                  Ver productos
                </Link>
              </EstadoVacio>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th scope="col">N°</th>
                      <th scope="col">Fecha</th>
                      <th scope="col">Total</th>
                      <th scope="col">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mias.map((o) => (
                      <tr key={o.id}>
                        <td>#{o.numero}</td>
                        <td>{formatoFecha(o.fecha)}</td>
                        <td>{formatoCLP(o.total)}</td>
                        <td>
                          <EstadoOrden estado={o.estado} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Pagina>
  );
}
