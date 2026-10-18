import { enOferta, esCritico, filtrarProductos, precioFinal, stockNumerico, stockSinDefinir, textoStock, tieneStock } from './productos.js';

describe('utils/productos', () => {
  it('trata el stock en blanco como 0 unidades y como "sin definir"', () => {
    expect(stockNumerico({ stock: '' })).toBe(0);
    expect(stockSinDefinir({ stock: '' })).toBeTrue();
    expect(tieneStock({ stock: '' })).toBeFalse();
    expect(textoStock({ stock: '' })).toBe('Stock por definir');
  });

  it('lee el stock numérico y arma el texto de disponibilidad', () => {
    expect(stockNumerico({ stock: '7' })).toBe(7);
    expect(textoStock({ stock: 7 })).toBe('Stock disponible: 7');
    expect(textoStock({ stock: 0 })).toBe('Sin stock');
  });

  it('usa el precio de oferta solo cuando es menor al precio normal', () => {
    expect(precioFinal({ precio: 1000, precioOferta: 800 })).toBe(800);
    expect(enOferta({ precio: 1000, precioOferta: 800 })).toBeTrue();
    expect(precioFinal({ precio: 1000, precioOferta: 1500 })).toBe(1000);
    expect(enOferta({ precio: 1000, precioOferta: '' })).toBeFalse();
  });

  it('marca un producto como crítico cuando su stock llega al mínimo', () => {
    expect(esCritico({ stock: 2, stockCritico: 5 })).toBeTrue();
    expect(esCritico({ stock: 5, stockCritico: 5 })).toBeTrue();
    expect(esCritico({ stock: 6, stockCritico: 5 })).toBeFalse();
    expect(esCritico({ stock: '', stockCritico: 5 })).toBeTrue();
  });

  describe('filtrarProductos', () => {
    const lista = [
      { id: 1, nombre: 'Ryzen 5', marca: 'AMD', categoriaId: 1, precio: 130000 },
      { id: 2, nombre: 'Core i5', marca: 'Intel', categoriaId: 1, precio: 150000 },
      { id: 3, nombre: 'RTX 4060', marca: 'NVIDIA', categoriaId: 2, precio: 400000, precioOferta: 350000 },
    ];

    it('filtra por texto sin distinguir mayúsculas', () => {
      expect(filtrarProductos(lista, { texto: 'ryzen' }).map((p) => p.id)).toEqual([1]);
    });

    it('filtra por categoría y por rango de precio (considerando ofertas)', () => {
      expect(filtrarProductos(lista, { categoriaId: '1' }).length).toBe(2);
      expect(filtrarProductos(lista, { min: '140000', max: '360000' }).map((p) => p.id)).toEqual([2, 3]);
    });

    it('ordena por precio sin modificar la lista original', () => {
      const ordenada = filtrarProductos(lista, { orden: 'precio-desc' });
      expect(ordenada.map((p) => p.id)).toEqual([3, 2, 1]);
      expect(lista[0].id).toBe(1);
    });
  });
});
