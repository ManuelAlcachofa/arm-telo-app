const formateadorCLP = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

/** 129990 -> "$129.990" */
export function formatoCLP(valor) {
  return formateadorCLP.format(Number(valor) || 0);
}

/** "2026-09-12" o fecha ISO -> "12-09-2026" */
export function formatoFecha(iso) {
  if (!iso) return '';
  const fecha = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  if (Number.isNaN(fecha.getTime())) return '';
  const dd = String(fecha.getDate()).padStart(2, '0');
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  return `${dd}-${mm}-${fecha.getFullYear()}`;
}
