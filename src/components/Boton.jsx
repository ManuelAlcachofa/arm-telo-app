/** Botón reutilizable. Recibe la etiqueta y la función `onClick` por props. */
export default function Boton({
  etiqueta,
  onClick,
  variante = 'primary',
  tipo = 'button',
  deshabilitado = false,
  icono,
  tamano,
  className = '',
  ...resto
}) {
  const clases = ['btn', `btn-${variante}`, tamano ? `btn-${tamano}` : '', className].filter(Boolean).join(' ');
  return (
    <button type={tipo} className={clases} onClick={onClick} disabled={deshabilitado} {...resto}>
      {icono && <i className={`bi ${icono} me-2`} aria-hidden="true" />}
      {etiqueta}
    </button>
  );
}
