import { Link } from 'react-router-dom';
import EstadoVacio from '../../components/EstadoVacio.jsx';
import { useColeccion } from '../../data/useColeccion.js';
import { esCritico, stockNumerico, stockSinDefinir } from '../../utils/productos.js';

export default function AdminCriticos() {
  const productos = useColeccion('productos');
  const criticos = productos.filter(esCritico);

  return (
    <>
      <Link to="/admin/productos" className="small">
        ← Volver a productos
      </Link>
      <h1 className="h3 mt-2">Productos críticos</h1>
      <p className="text-secondary">Productos con stock igual o menor a su stock crítico, o con stock sin definir.</p>

      {criticos.length === 0 ? (
        <EstadoVacio icono="bi-check2-circle" titulo="No hay productos críticos" texto="Todo el inventario está sobre su nivel mínimo." />
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th scope="col">Producto</th>
                <th scope="col">Stock</th>
                <th scope="col">Stock crítico</th>
                <th scope="col">Acción</th>
              </tr>
            </thead>
            <tbody>
              {criticos.map((p) => (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td>{stockSinDefinir(p) ? <span className="text-secondary">Por definir</span> : stockNumerico(p)}</td>
                  <td>{p.stockCritico}</td>
                  <td>
                    <Link to={`/admin/productos/${p.id}/editar`} className="btn btn-outline-primary btn-sm">
                      Reponer stock
                    </Link>
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
