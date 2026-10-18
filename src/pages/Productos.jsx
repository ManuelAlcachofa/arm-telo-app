import { useSearchParams } from 'react-router-dom';
import CampoFormulario from '../components/CampoFormulario.jsx';
import ListaProductos from '../components/ListaProductos.jsx';
import Pagina from '../components/Pagina.jsx';
import { useCarrito } from '../context/CarritoContext.jsx';
import { useColeccion } from '../data/useColeccion.js';
import { filtrarProductos } from '../utils/productos.js';

const OPCIONES_ORDEN = [
  { valor: '', etiqueta: 'Sin orden' },
  { valor: 'nombre', etiqueta: 'Nombre (A-Z)' },
  { valor: 'precio-asc', etiqueta: 'Precio: menor a mayor' },
  { valor: 'precio-desc', etiqueta: 'Precio: mayor a menor' },
];

export default function Productos() {
  const productos = useColeccion('productos');
  const categorias = useColeccion('categorias');
  const { agregar } = useCarrito();
  const [params, setParams] = useSearchParams();

  const filtros = {
    texto: params.get('q') ?? '',
    categoriaId: params.get('categoria') ?? '',
    min: params.get('min') ?? '',
    max: params.get('max') ?? '',
    orden: params.get('orden') ?? '',
  };

  const cambiar = (clave) => (e) => {
    const siguiente = new URLSearchParams(params);
    if (e.target.value) siguiente.set(clave, e.target.value);
    else siguiente.delete(clave);
    setParams(siguiente, { replace: true });
  };

  const visibles = filtrarProductos(productos, filtros);
  const hayFiltros = Object.values(filtros).some(Boolean);

  return (
    <Pagina titulo="Productos" subtitulo="Busca y filtra el catálogo de la tienda.">
      <form className="filtros row g-2 mb-4 align-items-end" role="search" onSubmit={(e) => e.preventDefault()}>
        <div className="col-12 col-md-4">
          <CampoFormulario id="filtro-q" etiqueta="Buscar" tipo="search" valor={filtros.texto} onChange={cambiar('q')} className="mb-0" />
        </div>
        <div className="col-6 col-md-3">
          <CampoFormulario
            id="filtro-categoria"
            etiqueta="Categoría"
            tipo="select"
            valor={filtros.categoriaId}
            onChange={cambiar('categoria')}
            className="mb-0"
            opciones={[{ valor: '', etiqueta: 'Todas' }, ...categorias.map((c) => ({ valor: String(c.id), etiqueta: c.nombre }))]}
          />
        </div>
        <div className="col-6 col-md-2">
          <CampoFormulario id="filtro-orden" etiqueta="Ordenar por" tipo="select" valor={filtros.orden} onChange={cambiar('orden')} opciones={OPCIONES_ORDEN} className="mb-0" />
        </div>
        <div className="col-6 col-md-1">
          <CampoFormulario id="filtro-min" etiqueta="Mín. $" tipo="number" min="0" valor={filtros.min} onChange={cambiar('min')} className="mb-0" />
        </div>
        <div className="col-6 col-md-2">
          <CampoFormulario id="filtro-max" etiqueta="Máx. $" tipo="number" min="0" valor={filtros.max} onChange={cambiar('max')} className="mb-0" />
        </div>
      </form>

      <p className="text-secondary small" aria-live="polite">
        {visibles.length} {visibles.length === 1 ? 'producto' : 'productos'}
        {hayFiltros && (
          <button type="button" className="btn btn-link btn-sm" onClick={() => setParams({}, { replace: true })}>
            Limpiar filtros
          </button>
        )}
      </p>

      <ListaProductos
        productos={visibles}
        categorias={categorias}
        onAgregar={agregar}
        mensajeVacio={hayFiltros ? 'No encontramos productos con esos filtros.' : 'Aún no hay productos disponibles.'}
      />
    </Pagina>
  );
}
