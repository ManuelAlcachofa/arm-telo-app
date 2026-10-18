const ESTILOS = {
  pagada: { clase: 'success', texto: 'Pagada' },
  pendiente: { clase: 'warning', texto: 'Pendiente' },
  rechazada: { clase: 'danger', texto: 'Rechazada' },
};

/** Etiqueta de color con el estado de una orden. */
export default function EstadoOrden({ estado }) {
  const estilo = ESTILOS[estado] ?? { clase: 'secondary', texto: estado };
  return <span className={`badge text-bg-${estilo.clase}`}>{estilo.texto}</span>;
}
