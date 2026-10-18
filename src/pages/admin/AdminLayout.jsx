import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const ENLACES = [
  { a: '/admin', texto: 'Dashboard', icono: 'bi-speedometer2', exacto: true },
  { a: '/admin/ordenes', texto: 'Órdenes', icono: 'bi-receipt' },
  { a: '/admin/productos', texto: 'Productos', icono: 'bi-box-seam' },
  { a: '/admin/categorias', texto: 'Categorías', icono: 'bi-tags' },
  { a: '/admin/usuarios', texto: 'Usuarios', icono: 'bi-people' },
  { a: '/admin/reportes', texto: 'Reportes', icono: 'bi-bar-chart-line' },
];

/** Estructura del panel de administración: menú lateral y área de contenido. */
export default function AdminLayout() {
  const { usuario, cerrarSesion } = useAuth();
  const navegar = useNavigate();

  return (
    <div className="admin d-flex flex-column flex-lg-row min-vh-100">
      <aside className="admin-lateral p-3">
        <Link to="/admin" className="marca d-block mb-1 text-decoration-none">
          ARMA<span>TELO</span>
        </Link>
        <small className="text-secondary d-block mb-3">Panel de administración</small>
        <nav className="nav nav-pills flex-row flex-lg-column gap-1" aria-label="Menú del administrador">
          {ENLACES.map((e) => (
            <NavLink key={e.a} to={e.a} end={e.exacto} className="nav-link">
              <i className={`bi ${e.icono} me-2`} aria-hidden="true" />
              {e.texto}
            </NavLink>
          ))}
          <hr className="d-none d-lg-block my-2" />
          <NavLink to="/admin/perfil" className="nav-link">
            <i className="bi bi-person-circle me-2" aria-hidden="true" />
            Perfil
          </NavLink>
          <Link to="/" className="nav-link">
            <i className="bi bi-shop me-2" aria-hidden="true" />
            Tienda
          </Link>
          <button
            type="button"
            className="nav-link text-start text-danger"
            onClick={() => {
              cerrarSesion();
              navegar('/');
            }}
          >
            <i className="bi bi-box-arrow-right me-2" aria-hidden="true" />
            Cerrar sesión
          </button>
        </nav>
        <small className="text-secondary d-none d-lg-block mt-4">Sesión: {usuario?.correo}</small>
      </aside>
      <main className="admin-contenido flex-grow-1 p-3 p-md-4">
        <Outlet />
      </main>
    </div>
  );
}
