import { useState } from 'react';
import { Link } from 'react-router-dom';
import CampoFormulario from '../../components/CampoFormulario.jsx';
import EstadoVacio from '../../components/EstadoVacio.jsx';
import { eliminar } from '../../data/db.js';
import { useColeccion } from '../../data/useColeccion.js';
import { formatoCLP } from '../../utils/formato.js';
import { esCritico, precioFinal, stockSinDefinir, stockNumerico } from '../../utils/productos.js';

export default function AdminProductos() {
  const productos = useColeccion('productos');
  const categorias = useColeccion('categorias');
  const [texto, setTexto] = useState('');

  const visibles = productos.filter((p) => `${p.nombre} ${p.marca ?? ''}`.toLowerCase().includes(texto.trim().toLowerCase()));

  const borrar = (producto) => {
    if (window.confirm(`¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`)) eliminar('productos', producto.id);
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h3 mb-0">Productos</h1>
        <div className="d-flex flex-wrap gap-2">
          <Link to="/admin/productos/criticos" className="btn btn-outline-warning btn-sm">
            Productos críticos
          </Link>
          <Link to="/admin/reportes" className="btn btn-outline-secondary btn-sm">
            Reportes
          </Link>
          <Link to="/admin/productos/nuevo" className="btn btn-primary btn-sm">
            <i className="bi bi-plus-lg me-1" aria-hidden="true" />
            Nuevo producto
          </Link>
        </div>
      </div>

      {productos.length === 0 ? (
        <EstadoVacio icono="bi-box-seam" titulo="Aún no hay productos" texto="Agrega el primero para que aparezca en la tienda.">
          <Link to="/admin/productos/nuevo" className="btn btn-primary">
            Agregar producto
          </Link>
        </EstadoVacio>
      ) : (
        <>
          <div className="row mb-2">
            <div className="col-md-4">
              <CampoFormulario id="buscar-producto" etiqueta="Buscar" tipo="search" valor={texto} onChange={(e) => setTexto(e.target.value)} />
            </div>
          </div>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th scope="col">Nombre</th>
                  <th scope="col">Categoría</th>
                  <th scope="col">Precio</th>
                  <th scope="col">Stock</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.nombre}
                      {p.marca && <small className="d-block text-secondary">{p.marca}</small>}
                    </td>
                    <td>{categorias.find((c) => String(c.id) === String(p.categoriaId))?.nombre ?? 'Sin categoría'}</td>
                    <td>{formatoCLP(precioFinal(p))}</td>
                    <td>
                      {stockSinDefinir(p) ? <span className="text-secondary">Por definir</span> : stockNumerico(p)}
                      {esCritico(p) && <span className="badge text-bg-warning ms-2">Crítico</span>}
                    </td>
                    <td className="text-nowrap">
                      <Link to={`/admin/productos/${p.id}/editar`} className="btn btn-outline-primary btn-sm me-1">
                        Editar
                      </Link>
                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => borrar(p)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
