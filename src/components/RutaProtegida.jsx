import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Protege un grupo de rutas.
 * - Sin sesión: manda a /login.
 * - Con `soloAdmin`: si la persona no es administradora la manda al inicio.
 */
export default function RutaProtegida({ soloAdmin = false }) {
  const { usuario, esAdmin } = useAuth();
  const ubicacion = useLocation();
  if (!usuario) return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  if (soloAdmin && !esAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
