import { useEffect } from 'react';
import { cargar, errorCarga, estadoCarga, fueCargada } from '../data/db.js';
import { useVersionDatos } from '../data/useColeccion.js';

/**
 * Espera a que lleguen desde el backend las colecciones indicadas antes de mostrar su contenido.
 * Así las páginas (y sus formularios) se dibujan ya con los datos, igual que con la base local.
 * Si el backend no responde, muestra el error y un botón para reintentar.
 */
export default function CargaDatos({ colecciones, children }) {
  useVersionDatos();
  const clave = colecciones.join(',');

  useEffect(() => {
    colecciones.forEach((c) => {
      if (estadoCarga(c) === 'pendiente') cargar(c);
    });
  });

  const conError = colecciones.find((c) => estadoCarga(c) === 'error' && !fueCargada(c));
  if (conError) {
    return (
      <div className="container py-5" role="alert">
        <div className="alert alert-danger d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
          <span>
            <i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />
            {errorCarga(conError)}
          </span>
          <button type="button" className="btn btn-outline-light btn-sm" onClick={() => clave.split(',').forEach((c) => cargar(c, { forzar: true }))}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const esperando = colecciones.some((c) => !fueCargada(c));
  if (esperando) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" role="status" aria-live="polite">
        <div className="spinner-border text-primary me-2" aria-hidden="true" />
        <span>Cargando…</span>
      </div>
    );
  }

  return children;
}
