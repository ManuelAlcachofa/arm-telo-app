import { useState } from 'react';
import { Link } from 'react-router-dom';
import Alerta from '../../components/Alerta.jsx';
import EstadoVacio from '../../components/EstadoVacio.jsx';
import { eliminar } from '../../data/db.js';
import { useColeccion } from '../../data/useColeccion.js';

export default function AdminCategorias() {
  const categorias = useColeccion('categorias');
  const productos = useColeccion('productos');
  const [aviso, setAviso] = useState('');

  const borrar = (categoria) => {
    const usados = productos.filter((p) => String(p.categoriaId) === String(categoria.id)).length;
    if (usados > 0) {
      setAviso(`No puedes eliminar "${categoria.nombre}" porque tiene ${usados} producto(s). Cámbialos de categoría primero.`);
      return;
    }
    setAviso('');
    if (window.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) eliminar('categorias', categoria.id);
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Categorías</h1>
        <Link to="/admin/categorias/nueva" className="btn btn-primary btn-sm">
          <i className="bi bi-plus-lg me-1" aria-hidden="true" />
          Nueva categoría
        </Link>
      </div>
      <Alerta mensaje={aviso} onCerrar={() => setAviso('')} />

      {categorias.length === 0 ? (
        <EstadoVacio icono="bi-tags" titulo="No hay categorías" texto="Crea una para poder clasificar tus productos." />
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Descripción</th>
                <th scope="col">Productos</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((c) => (
                <tr key={c.id}>
                  <td>
                    <i className={`bi ${c.icono || 'bi-tag'} me-2 text-ember`} aria-hidden="true" />
                    {c.nombre}
                  </td>
                  <td className="text-secondary">{c.descripcion}</td>
                  <td>{productos.filter((p) => String(p.categoriaId) === String(c.id)).length}</td>
                  <td className="text-nowrap">
                    <Link to={`/admin/categorias/${c.id}/editar`} className="btn btn-outline-primary btn-sm me-1">
                      Editar
                    </Link>
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => borrar(c)}>
                      Eliminar
                    </button>
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
