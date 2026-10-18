import { Link } from 'react-router-dom';
import { useColeccion } from '../../data/useColeccion.js';

const MODULOS = [
  { a: '/admin/ordenes', icono: 'bi-receipt', titulo: 'Órdenes', texto: 'Revisa las compras realizadas y sus boletas.' },
  { a: '/admin/productos', icono: 'bi-box-seam', titulo: 'Productos', texto: 'Agrega productos y administra su stock.' },
  { a: '/admin/categorias', icono: 'bi-tags', titulo: 'Categorías', texto: 'Organiza los productos por categoría.' },
  { a: '/admin/usuarios', icono: 'bi-people', titulo: 'Usuarios', texto: 'Gestiona las cuentas y sus roles.' },
  { a: '/admin/reportes', icono: 'bi-bar-chart-line', titulo: 'Reportes', texto: 'Ventas, productos más vendidos e inventario.' },
  { a: '/admin/perfil', icono: 'bi-person-circle', titulo: 'Perfil', texto: 'Edita tus datos de administrador.' },
  { a: '/', icono: 'bi-shop', titulo: 'Tienda', texto: 'Mira la tienda como la ven tus clientes.' },
];

export default function AdminDashboard() {
  const ordenes = useColeccion('ordenes');
  const productos = useColeccion('productos');
  const usuarios = useColeccion('usuarios');
  const pagadas = ordenes.filter((o) => o.estado === 'pagada');

  return (
    <>
      <h1 className="h3">Dashboard</h1>
      <p className="text-secondary">Resumen de la actividad de la tienda.</p>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="resumen-cifra resumen-cifra--compras">
            <i className="bi bi-cart3" aria-hidden="true" />
            <div>
              <small>Compras pagadas</small>
              <strong>{pagadas.length}</strong>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="resumen-cifra resumen-cifra--productos">
            <i className="bi bi-box-seam" aria-hidden="true" />
            <div>
              <small>Productos</small>
              <strong>{productos.length}</strong>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="resumen-cifra resumen-cifra--usuarios">
            <i className="bi bi-people" aria-hidden="true" />
            <div>
              <small>Usuarios</small>
              <strong>{usuarios.length}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3">
        {MODULOS.map((m) => (
          <div className="col" key={m.a}>
            <Link to={m.a} className="card h-100 text-center text-decoration-none p-3 tarjeta-categoria">
              <i className={`bi ${m.icono} fs-2 text-ember`} aria-hidden="true" />
              <h2 className="h6 mt-2">{m.titulo}</h2>
              <small className="text-secondary">{m.texto}</small>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
