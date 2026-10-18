import ListaProductos from '../components/ListaProductos.jsx';
import Pagina from '../components/Pagina.jsx';
import { useCarrito } from '../context/CarritoContext.jsx';
import { useColeccion } from '../data/useColeccion.js';
import { enOferta } from '../utils/productos.js';

export default function Ofertas() {
  const productos = useColeccion('productos');
  const categorias = useColeccion('categorias');
  const { agregar } = useCarrito();

  return (
    <Pagina titulo="Ofertas" subtitulo="Todos los productos con precio rebajado.">
      <ListaProductos
        productos={productos.filter(enOferta)}
        categorias={categorias}
        onAgregar={agregar}
        mensajeVacio="Por ahora no hay productos en oferta."
      />
    </Pagina>
  );
}
