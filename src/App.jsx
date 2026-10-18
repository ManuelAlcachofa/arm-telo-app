import { Route, Routes } from 'react-router-dom';
import LayoutTienda from './components/LayoutTienda.jsx';
import RutaProtegida from './components/RutaProtegida.jsx';
import Blogs from './pages/Blogs.jsx';
import Carrito from './pages/Carrito.jsx';
import Categorias from './pages/Categorias.jsx';
import Checkout from './pages/Checkout.jsx';
import CompraError from './pages/CompraError.jsx';
import CompraExitosa from './pages/CompraExitosa.jsx';
import Contacto from './pages/Contacto.jsx';
import DetalleBlog from './pages/DetalleBlog.jsx';
import DetalleProducto from './pages/DetalleProducto.jsx';
import Inicio from './pages/Inicio.jsx';
import Login from './pages/Login.jsx';
import NoEncontrada from './pages/NoEncontrada.jsx';
import Nosotros from './pages/Nosotros.jsx';
import Ofertas from './pages/Ofertas.jsx';
import Perfil from './pages/Perfil.jsx';
import Productos from './pages/Productos.jsx';
import Registro from './pages/Registro.jsx';
import AdminBoleta from './pages/admin/AdminBoleta.jsx';
import AdminCategoriaForm from './pages/admin/AdminCategoriaForm.jsx';
import AdminCategorias from './pages/admin/AdminCategorias.jsx';
import AdminCriticos from './pages/admin/AdminCriticos.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminHistorial from './pages/admin/AdminHistorial.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminOrdenes from './pages/admin/AdminOrdenes.jsx';
import AdminPerfil from './pages/admin/AdminPerfil.jsx';
import AdminProductoForm from './pages/admin/AdminProductoForm.jsx';
import AdminProductos from './pages/admin/AdminProductos.jsx';
import AdminReportes from './pages/admin/AdminReportes.jsx';
import AdminUsuarioForm from './pages/admin/AdminUsuarioForm.jsx';
import AdminUsuarios from './pages/admin/AdminUsuarios.jsx';

/** Mapa de rutas de la aplicación (tienda pública y panel de administración). */
export default function App() {
  return (
    <Routes>
      <Route element={<LayoutTienda />}>
        <Route index element={<Inicio />} />
        <Route path="productos" element={<Productos />} />
        <Route path="productos/:id" element={<DetalleProducto />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="categorias/:id" element={<Categorias />} />
        <Route path="ofertas" element={<Ofertas />} />
        <Route path="carrito" element={<Carrito />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="compra/exitosa/:id" element={<CompraExitosa />} />
        <Route path="compra/error/:id" element={<CompraError />} />
        <Route path="login" element={<Login />} />
        <Route path="registro" element={<Registro />} />
        <Route path="nosotros" element={<Nosotros />} />
        <Route path="blogs" element={<Blogs />} />
        <Route path="blogs/:id" element={<DetalleBlog />} />
        <Route path="contacto" element={<Contacto />} />
        <Route element={<RutaProtegida />}>
          <Route path="perfil" element={<Perfil />} />
        </Route>
        <Route path="*" element={<NoEncontrada />} />
      </Route>

      <Route path="admin" element={<RutaProtegida soloAdmin />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="ordenes" element={<AdminOrdenes />} />
          <Route path="ordenes/:id" element={<AdminBoleta />} />
          <Route path="productos" element={<AdminProductos />} />
          <Route path="productos/nuevo" element={<AdminProductoForm />} />
          <Route path="productos/criticos" element={<AdminCriticos />} />
          <Route path="productos/:id/editar" element={<AdminProductoForm />} />
          <Route path="categorias" element={<AdminCategorias />} />
          <Route path="categorias/nueva" element={<AdminCategoriaForm />} />
          <Route path="categorias/:id/editar" element={<AdminCategoriaForm />} />
          <Route path="usuarios" element={<AdminUsuarios />} />
          <Route path="usuarios/nuevo" element={<AdminUsuarioForm />} />
          <Route path="usuarios/:id/editar" element={<AdminUsuarioForm />} />
          <Route path="usuarios/:id/historial" element={<AdminHistorial />} />
          <Route path="reportes" element={<AdminReportes />} />
          <Route path="perfil" element={<AdminPerfil />} />
        </Route>
      </Route>
    </Routes>
  );
}
