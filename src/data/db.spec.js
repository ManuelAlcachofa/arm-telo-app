import { actualizar, cargar, crear, eliminar, estadoCarga, listar, obtener, reiniciarDB, suscribir } from './db.js';
import { iniciarSesionComo, limpiarTodo } from '../test/ayudas.jsx';
import { productoEnServidor } from '../test/servidorFalso.js';

describe('data/db (capa de datos conectada al backend)', () => {
  beforeEach(() => {
    limpiarTodo();
    iniciarSesionComo('admin@armatelo.cl'); // crear/editar/eliminar productos exige rol admin
  });

  it('carga las colecciones desde el backend: productos vacíos y categorías iniciales', async () => {
    expect(listar('productos')).toEqual([]);
    await cargar('productos');
    await cargar('categorias');
    expect(estadoCarga('productos')).toBe('lista');
    expect(listar('productos')).toEqual([]);
    expect(listar('categorias').length).toBeGreaterThan(0);
  });

  it('CREATE: guarda en el backend y devuelve el registro con el id asignado', async () => {
    await cargar('productos');
    const a = await crear('productos', { nombre: 'A', categoriaId: 1, precio: 100, stockCritico: 1 });
    const b = await crear('productos', { nombre: 'B', categoriaId: 1, precio: 200, stockCritico: 1 });
    expect(a.id).toBe(1);
    expect(b.id).toBe(2);
    expect(listar('productos').length).toBe(2);
    expect(productoEnServidor(2).nombre).toBe('B');
  });

  it('adapta los campos vacíos: null del backend se ve como "" en el frontend', async () => {
    const p = await crear('productos', { nombre: 'A', categoriaId: 1, precio: 100, precioOferta: '', stock: '', stockCritico: 1 });
    expect(p.precioOferta).toBe('');
    expect(p.stock).toBe('');
    expect(productoEnServidor(p.id).stock).toBeNull();
  });

  it('READ: obtiene un registro por id aunque el id venga como texto', async () => {
    await crear('productos', { nombre: 'A', categoriaId: 1, precio: 100, stockCritico: 1 });
    expect(obtener('productos', '1').nombre).toBe('A');
    expect(obtener('productos', 99)).toBeNull();
  });

  it('UPDATE: mezcla los cambios sin perder los otros campos', async () => {
    await cargar('productos');
    await crear('productos', { nombre: 'A', categoriaId: 1, precio: 100, stockCritico: 1 });
    const editado = await actualizar('productos', 1, { precio: 200 });
    expect(editado.nombre).toBe('A');
    expect(editado.precio).toBe(200);
    expect(productoEnServidor(1).precio).toBe(200);
  });

  it('DELETE: elimina el registro en el backend y en la caché', async () => {
    await cargar('productos');
    await crear('productos', { nombre: 'A', categoriaId: 1, precio: 100, stockCritico: 1 });
    expect(await eliminar('productos', 1)).toBeTrue();
    expect(listar('productos')).toEqual([]);
    expect(productoEnServidor(1)).toBeNull();
  });

  it('una operación rechazada por el backend lanza un error', async () => {
    let error = null;
    try {
      await eliminar('productos', 999);
    } catch (e) {
      error = e;
    }
    expect(error.response.status).toBe(404);
  });

  it('avisa a los suscriptores en cada cambio y deja de avisar al desuscribirse', async () => {
    await cargar('productos');
    const aviso = jasmine.createSpy('aviso');
    const desuscribir = suscribir(aviso);
    await crear('productos', { nombre: 'A', categoriaId: 1, precio: 100, stockCritico: 1 });
    expect(aviso).toHaveBeenCalledTimes(1);
    desuscribir();
    await crear('productos', { nombre: 'B', categoriaId: 1, precio: 100, stockCritico: 1 });
    expect(aviso).toHaveBeenCalledTimes(1);
  });

  it('reiniciarDB vacía la caché para volver a pedir los datos', async () => {
    await crear('productos', { nombre: 'A', categoriaId: 1, precio: 100, stockCritico: 1 });
    reiniciarDB();
    expect(estadoCarga('productos')).toBe('pendiente');
    expect(listar('productos')).toEqual([]);
    await cargar('productos');
    expect(listar('productos').length).toBe(1);
  });
});
