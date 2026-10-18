import Boton from '../../components/Boton.jsx';
import { useColeccion } from '../../data/useColeccion.js';
import { formatoCLP } from '../../utils/formato.js';
import { esCritico, stockNumerico } from '../../utils/productos.js';

/** Calcula las cifras del reporte a partir de las órdenes y los productos (función pura). */
export function calcularReporte(ordenes, productos, categorias) {
  const pagadas = ordenes.filter((o) => o.estado === 'pagada');
  const ingresos = pagadas.reduce((suma, o) => suma + o.total, 0);

  const porProducto = {};
  const porCategoria = {};
  pagadas.forEach((o) =>
    o.items.forEach((i) => {
      porProducto[i.nombre] = (porProducto[i.nombre] ?? 0) + i.cantidad;
      const nombreCategoria = categorias.find((c) => String(c.id) === String(i.categoriaId))?.nombre ?? 'Sin categoría';
      porCategoria[nombreCategoria] = (porCategoria[nombreCategoria] ?? 0) + i.subtotal;
    }),
  );

  return {
    ingresos,
    cantidadPagadas: pagadas.length,
    cantidadRechazadas: ordenes.filter((o) => o.estado === 'rechazada').length,
    unidadesVendidas: Object.values(porProducto).reduce((a, b) => a + b, 0),
    masVendidos: Object.entries(porProducto).sort((a, b) => b[1] - a[1]).slice(0, 5),
    ventasPorCategoria: Object.entries(porCategoria).sort((a, b) => b[1] - a[1]),
    productosCriticos: productos.filter(esCritico).length,
    valorInventario: productos.reduce((suma, p) => suma + (Number(p.precio) || 0) * stockNumerico(p), 0),
  };
}

function descargarCSV(ordenes) {
  const filas = [['numero', 'fecha', 'cliente', 'correo', 'estado', 'total']];
  ordenes.forEach((o) => filas.push([o.numero, o.fecha, `${o.cliente.nombre} ${o.cliente.apellidos}`, o.cliente.correo, o.estado, o.total]));
  const csv = filas.map((f) => f.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = 'ordenes-armatelo.csv';
  enlace.click();
  URL.revokeObjectURL(url);
}

export default function AdminReportes() {
  const ordenes = useColeccion('ordenes');
  const productos = useColeccion('productos');
  const categorias = useColeccion('categorias');
  const r = calcularReporte(ordenes, productos, categorias);

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h3 mb-0">Reportes</h1>
        <Boton etiqueta="Descargar órdenes (CSV)" icono="bi-download" variante="outline-secondary" tamano="sm" deshabilitado={ordenes.length === 0} onClick={() => descargarCSV(ordenes)} />
      </div>

      <div className="row row-cols-2 row-cols-lg-4 g-3 mb-4">
        {[
          ['Ingresos', formatoCLP(r.ingresos)],
          ['Compras pagadas', r.cantidadPagadas],
          ['Pagos rechazados', r.cantidadRechazadas],
          ['Unidades vendidas', r.unidadesVendidas],
          ['Productos críticos', r.productosCriticos],
          ['Valor del inventario', formatoCLP(r.valorInventario)],
        ].map(([titulo, valor]) => (
          <div className="col" key={titulo}>
            <div className="card p-3 h-100">
              <small className="text-secondary">{titulo}</small>
              <strong className="fs-4">{valor}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card p-3 h-100">
            <h2 className="h6">Productos más vendidos</h2>
            {r.masVendidos.length === 0 ? (
              <p className="text-secondary mb-0">Todavía no hay ventas.</p>
            ) : (
              <ol className="mb-0">
                {r.masVendidos.map(([nombre, unidades]) => (
                  <li key={nombre}>
                    {nombre} <span className="text-secondary">({unidades} un.)</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card p-3 h-100">
            <h2 className="h6">Ventas por categoría</h2>
            {r.ventasPorCategoria.length === 0 ? (
              <p className="text-secondary mb-0">Todavía no hay ventas.</p>
            ) : (
              <ul className="list-unstyled mb-0">
                {r.ventasPorCategoria.map(([nombre, monto]) => (
                  <li key={nombre} className="d-flex justify-content-between">
                    <span>{nombre}</span>
                    <strong>{formatoCLP(monto)}</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
