import { useState } from 'react';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCarrito } from '../context/CarritoContext.jsx';
import { useColeccion } from '../data/useColeccion.js';
import { formatoCLP } from '../utils/formato.js';
import BarraBusqueda from './BarraBusqueda.jsx';

/** Barra superior de la tienda: buscador, enlaces, categorías, carrito y sesión. */
export default function BarraNavegacion() {
  const [abierta, setAbierta] = useState(false);
  const categorias = useColeccion('categorias');
  const { total, cantidadTotal } = useCarrito();
  const { usuario, esAdmin, cerrarSesion } = useAuth();
  const navegar = useNavigate();

  const cerrar = () => setAbierta(false);

  return (
    <Navbar expand="xl" expanded={abierta} onToggle={setAbierta} className="barra-tienda" sticky="top" data-bs-theme="dark">
      <Container fluid="xl">
        <Navbar.Brand as={Link} to="/" onClick={cerrar} className="marca">
          ARMA<span>TELO</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="menu-principal" aria-label="Abrir menú" />
        <Navbar.Collapse id="menu-principal">
          <Nav className="me-auto mb-2 mb-xl-0 align-items-xl-center">
            <Nav.Link as={NavLink} to="/" end onClick={cerrar}>
              Inicio
            </Nav.Link>
            <Nav.Link as={NavLink} to="/productos" onClick={cerrar}>
              Productos
            </Nav.Link>
            <NavDropdown title="Categorías" id="menu-categorias">
              <NavDropdown.Item as={Link} to="/categorias" onClick={cerrar}>
                Ver todas
              </NavDropdown.Item>
              <NavDropdown.Divider />
              {categorias.map((c) => (
                <NavDropdown.Item as={Link} to={`/categorias/${c.id}`} key={c.id} onClick={cerrar}>
                  {c.nombre}
                </NavDropdown.Item>
              ))}
            </NavDropdown>
            <Nav.Link as={NavLink} to="/ofertas" onClick={cerrar}>
              Ofertas
            </Nav.Link>
            <Nav.Link as={NavLink} to="/nosotros" onClick={cerrar}>
              Nosotros
            </Nav.Link>
            <Nav.Link as={NavLink} to="/blogs" onClick={cerrar}>
              Blog
            </Nav.Link>
            <Nav.Link as={NavLink} to="/contacto" onClick={cerrar}>
              Contacto
            </Nav.Link>
          </Nav>

          <div className="d-flex flex-column flex-xl-row gap-2 align-items-xl-center">
            <BarraBusqueda onBuscar={cerrar} />
            <Link to="/carrito" className="btn btn-primary btn-sm boton-carrito text-nowrap" onClick={cerrar}>
              <i className="bi bi-cart3 me-2" aria-hidden="true" />
              Carrito {formatoCLP(total)}
              {cantidadTotal > 0 && <span className="badge text-bg-light ms-2">{cantidadTotal}</span>}
            </Link>
            {usuario ? (
              <NavDropdown title={usuario.nombre} id="menu-usuario" align="end">
                <NavDropdown.Item as={Link} to="/perfil" onClick={cerrar}>
                  Mi perfil
                </NavDropdown.Item>
                {esAdmin && (
                  <NavDropdown.Item as={Link} to="/admin" onClick={cerrar}>
                    Panel de administración
                  </NavDropdown.Item>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item
                  as="button"
                  onClick={() => {
                    cerrarSesion();
                    cerrar();
                    navegar('/');
                  }}
                >
                  Cerrar sesión
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-light btn-sm text-nowrap" onClick={cerrar}>
                  Iniciar sesión
                </Link>
                <Link to="/registro" className="btn btn-outline-primary btn-sm text-nowrap" onClick={cerrar}>
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
