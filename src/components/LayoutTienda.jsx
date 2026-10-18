import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BarraNavegacion from './BarraNavegacion.jsx';
import PieDePagina from './PieDePagina.jsx';

/** Estructura común de todas las páginas públicas. */
export default function LayoutTienda() {
  const { pathname } = useLocation();

  // Al cambiar de página se vuelve al comienzo.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <BarraNavegacion />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <PieDePagina />
    </div>
  );
}
