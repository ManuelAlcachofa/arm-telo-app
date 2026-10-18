import { Link } from 'react-router-dom';
import EstadoVacio from '../../components/EstadoVacio.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { eliminar } from '../../data/db.js';
import { useColeccion } from '../../data/useColeccion.js';

export default function AdminUsuarios() {
  const usuarios = useColeccion('usuarios');
  const { usuario: actual } = useAuth();

  const borrar = (u) => {
    if (window.confirm(`¿Eliminar a ${u.nombre} ${u.apellidos}?`)) eliminar('usuarios', u.id);
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Usuarios</h1>
        <Link to="/admin/usuarios/nuevo" className="btn btn-primary btn-sm">
          <i className="bi bi-plus-lg me-1" aria-hidden="true" />
          Nuevo usuario
        </Link>
      </div>

      {usuarios.length === 0 ? (
        <EstadoVacio icono="bi-people" titulo="No hay usuarios" />
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Correo</th>
                <th scope="col">Rol</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td>
                    {u.nombre} {u.apellidos}
                  </td>
                  <td>{u.correo}</td>
                  <td>
                    <span className={`badge text-bg-${u.rol === 'admin' ? 'primary' : 'secondary'}`}>
                      {u.rol === 'admin' ? 'Administrador' : 'Cliente'}
                    </span>
                  </td>
                  <td className="text-nowrap">
                    <Link to={`/admin/usuarios/${u.id}/editar`} className="btn btn-outline-primary btn-sm me-1">
                      Editar
                    </Link>
                    <Link to={`/admin/usuarios/${u.id}/historial`} className="btn btn-outline-secondary btn-sm me-1">
                      Historial de compras
                    </Link>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      disabled={actual?.id === u.id}
                      title={actual?.id === u.id ? 'No puedes eliminar tu propia cuenta' : undefined}
                      onClick={() => borrar(u)}
                    >
                      Eliminar
                    </button>
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
