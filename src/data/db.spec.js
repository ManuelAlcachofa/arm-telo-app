import { actualizar, crear, eliminar, listar, obtener, reiniciarDB, suscribir } from './db.js';
import { limpiarTodo } from '../test/ayudas.jsx';

describe('data/db (base de datos simulada)', () => {
  beforeEach(limpiarTodo);

  it('parte con los productos en blanco y con categorías cargadas', () => {
    expect(listar('productos')).toEqual([]);
    expect(listar('categorias').length).toBeGreaterThan(0);
  });

  it('CREATE: asigna ids autoincrementales', () => {
    const a = crear('productos', { nombre: 'A' });
    const b = crear('productos', { nombre: 'B' });
    expect(a.id).toBe(1);
    expect(b.id).toBe(2);
    expect(listar('productos').length).toBe(2);
  });

  it('READ: obtiene un registro por id aunque el id venga como texto', () => {
    crear('productos', { nombre: 'A' });
    expect(obtener('productos', '1').nombre).toBe('A');
    expect(obtener('productos', 99)).toBeNull();
  });

  it('UPDATE: mezcla los cambios sin perder los otros campos', () => {
    crear('productos', { nombre: 'A', precio: 100 });
    const editado = actualizar('productos', 1, { precio: 200 });
    expect(editado).toEqual({ nombre: 'A', precio: 200, id: 1 });
    expect(actualizar('productos', 50, { precio: 1 })).toBeNull();
  });

  it('DELETE: elimina el registro y avisa si existía', () => {
    crear('productos', { nombre: 'A' });
    expect(eliminar('productos', 1)).toBeTrue();
    expect(eliminar('productos', 1)).toBeFalse();
    expect(listar('productos')).toEqual([]);
  });

  it('persiste los cambios en localStorage', () => {
    crear('productos', { nombre: 'Guardado' });
    const guardado = JSON.parse(window.localStorage.getItem('armatelo:productos'));
    expect(guardado[0].nombre).toBe('Guardado');
  });

  it('avisa a los suscriptores en cada cambio y deja de avisar al desuscribirse', () => {
    const aviso = jasmine.createSpy('aviso');
    const desuscribir = suscribir(aviso);
    crear('productos', { nombre: 'A' });
    expect(aviso).toHaveBeenCalledTimes(1);
    desuscribir();
    crear('productos', { nombre: 'B' });
    expect(aviso).toHaveBeenCalledTimes(1);
  });

  it('reiniciarDB vuelve a los datos iniciales', () => {
    crear('productos', { nombre: 'A' });
    reiniciarDB();
    expect(listar('productos')).toEqual([]);
  });
});
