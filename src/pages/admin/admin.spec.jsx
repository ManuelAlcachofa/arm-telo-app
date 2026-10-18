import { fireEvent, screen, within } from '@testing-library/react';
import { listar } from '../../data/db.js';
import { crearProducto, limpiarTodo, renderizarConApp } from '../../test/ayudas.jsx';
import App from '../../App.jsx';
import AdminProductos from './AdminProductos.jsx';
import { validarProducto } from './AdminProductoForm.jsx';
import { calcularReporte } from './AdminReportes.jsx';

describe('Panel de administración', () => {
  beforeEach(limpiarTodo);

  describe('validarProducto', () => {
    const valido = { nombre: 'A', categoriaId: '1', precio: '1000', precioOferta: '', stock: '', stockCritico: 5 };

    it('acepta un producto con el stock en blanco', () => {
      expect(Object.values(validarProducto(valido)).every((m) => !m)).toBeTrue();
    });

    it('rechaza una oferta mayor o igual al precio normal', () => {
      expect(validarProducto({ ...valido, precioOferta: '1000' }).precioOferta).toContain('menor');
    });

    it('rechaza stocks que no sean enteros', () => {
      expect(validarProducto({ ...valido, stock: '2.5' }).stock).toContain('entero');
    });
  });

  describe('calcularReporte', () => {
    it('suma solo las órdenes pagadas y ordena los más vendidos', () => {
      const ordenes = [
        { estado: 'pagada', total: 3000, items: [{ nombre: 'A', cantidad: 2, subtotal: 2000, categoriaId: 1 }, { nombre: 'B', cantidad: 1, subtotal: 1000, categoriaId: 1 }] },
        { estado: 'rechazada', total: 500, items: [{ nombre: 'A', cantidad: 9, subtotal: 500, categoriaId: 1 }] },
      ];
      const reporte = calcularReporte(ordenes, [], [{ id: 1, nombre: 'Procesadores' }]);
      expect(reporte.ingresos).toBe(3000);
      expect(reporte.cantidadRechazadas).toBe(1);
      expect(reporte.masVendidos[0]).toEqual(['A', 2]);
      expect(reporte.ventasPorCategoria[0]).toEqual(['Procesadores', 3000]);
    });
  });

  describe('<AdminProductos />', () => {
    it('muestra un mensaje cuando todavía no hay productos', () => {
      renderizarConApp(<AdminProductos />);
      expect(screen.getByText('Aún no hay productos')).toBeTruthy();
    });

    it('elimina un producto después de confirmar', () => {
      crearProducto({ nombre: 'Producto uno' });
      crearProducto({ nombre: 'Producto dos' });
      const confirmar = spyOn(window, 'confirm').and.returnValue(true);
      renderizarConApp(<AdminProductos />);

      const fila = screen.getByText('Producto uno').closest('tr');
      fireEvent.click(within(fila).getByRole('button', { name: 'Eliminar' }));

      expect(confirmar).toHaveBeenCalled();
      expect(listar('productos').map((p) => p.nombre)).toEqual(['Producto dos']);
    });

    it('no elimina nada si se cancela la confirmación', () => {
      crearProducto({ nombre: 'Producto uno' });
      spyOn(window, 'confirm').and.returnValue(false);
      renderizarConApp(<AdminProductos />);
      fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
      expect(listar('productos').length).toBe(1);
    });
  });

  describe('protección de rutas', () => {
    it('manda a iniciar sesión a quien no ha entrado', () => {
      renderizarConApp(<App />, { ruta: '/admin' });
      expect(screen.getByRole('heading', { name: 'Inicia sesión' })).toBeTruthy();
    });

    it('deja entrar al administrador', () => {
      window.localStorage.setItem('armatelo:sesion', '1');
      renderizarConApp(<App />, { ruta: '/admin' });
      expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeTruthy();
    });
  });
});
