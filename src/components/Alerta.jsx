/** Mensaje destacado. No dibuja nada si no hay mensaje. */
export default function Alerta({ tipo = 'danger', mensaje, onCerrar }) {
  if (!mensaje) return null;
  return (
    <div className={`alert alert-${tipo} d-flex justify-content-between align-items-start`} role="alert">
      <span>{mensaje}</span>
      {onCerrar && <button type="button" className="btn-close" aria-label="Cerrar" onClick={onCerrar} />}
    </div>
  );
}
