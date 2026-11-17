import { fireEvent, screen, within } from '@testing-library/react';
import { crearProducto, esperarQue, iniciarSesionComo, limpiarTodo, renderizarConApp } from '../../test/ayudas.jsx';
import { productoEnServidor } from '../../test/servidorFalso.js';
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
    beforeEach(() => iniciarSesionComo('admin@armatelo.cl'));

    it('muestra un mensaje cuando todavía no hay productos', async () => {
      renderizarConApp(<AdminProductos />);
      expect(await screen.findByText('Aún no hay productos')).toBeTruthy();
    });

    it('elimina un producto en el backend después de confirmar', async () => {
      const uno = crearProducto({ nombre: 'Producto uno' });
      crearProducto({ nombre: 'Producto dos' });
      const confirmar = spyOn(window, 'confirm').and.returnValue(true);
      renderizarConApp(<AdminProductos />);

      const fila = (await screen.findByText('Producto uno')).closest('tr');
      fireEvent.click(within(fila).getByRole('button', { name: 'Eliminar' }));

      expect(confirmar).toHaveBeenCalled();
      await esperarQue(() => screen.queryByText('Producto uno') === null);
      expect(productoEnServidor(uno.id)).toBeNull();
      expect(screen.getByText('Producto dos')).toBeTruthy();
    });

    it('no elimina nada si se cancela la confirmación', async () => {
      const uno = crearProducto({ nombre: 'Producto uno' });
      spyOn(window, 'confirm').and.returnValue(false);
      renderizarConApp(<AdminProductos />);
      fireEvent.click(await screen.findByRole('button', { name: 'Eliminar' }));
      expect(productoEnServidor(uno.id)).toBeTruthy();
      expect(screen.getByText('Producto uno')).toBeTruthy();
    });
  });

  describe('protección de rutas', () => {
    it('manda a iniciar sesión a quien no ha entrado', async () => {
      renderizarConApp(<App />, { ruta: '/admin' });
      expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeTruthy();
    });

    it('deja entrar al administrador', async () => {
      iniciarSesionComo('admin@armatelo.cl');
      renderizarConApp(<App />, { ruta: '/admin' });
      expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeTruthy();
    });
  });
});
