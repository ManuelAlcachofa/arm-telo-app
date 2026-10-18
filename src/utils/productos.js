// Reglas de negocio sobre productos (funciones puras, fáciles de probar).

/** Un stock en blanco ('' o null) significa "aún sin definir" y se trata como 0 unidades. */
export function stockNumerico(producto) {
  const valor = producto?.stock;
  if (valor === '' || valor === null || valor === undefined) return 0;
  const numero = Number(valor);
  return Number.isFinite(numero) && numero > 0 ? Math.floor(numero) : 0;
}

export function stockSinDefinir(producto) {
  const valor = producto?.stock;
  return valor === '' || valor === null || valor === undefined;
}

export function tieneStock(producto) {
  return stockNumerico(producto) > 0;
}

export function enOferta(producto) {
  const oferta = Number(producto?.precioOferta);
  return Number.isFinite(oferta) && oferta > 0 && oferta < Number(producto?.precio);
}

export function precioFinal(producto) {
  return enOferta(producto) ? Number(producto.precioOferta) : Number(producto?.precio) || 0;
}

export function esCritico(producto) {
  const critico = Number(producto?.stockCritico);
  return stockNumerico(producto) <= (Number.isFinite(critico) ? critico : 0);
}

export function textoStock(producto) {
  if (stockSinDefinir(producto)) return 'Stock por definir';
  const unidades = stockNumerico(producto);
  return unidades > 0 ? `Stock disponible: ${unidades}` : 'Sin stock';
}

const ORDENES = {
  'precio-asc': (a, b) => precioFinal(a) - precioFinal(b),
  'precio-desc': (a, b) => precioFinal(b) - precioFinal(a),
  nombre: (a, b) => a.nombre.localeCompare(b.nombre, 'es'),
};

/** Filtra y ordena una lista de productos según los criterios entregados. */
export function filtrarProductos(lista, { texto = '', categoriaId = '', min = '', max = '', orden = '' } = {}) {
  const buscado = texto.trim().toLowerCase();
  const resultado = lista.filter((p) => {
    if (buscado && !`${p.nombre} ${p.marca ?? ''} ${p.descripcion ?? ''}`.toLowerCase().includes(buscado)) return false;
    if (categoriaId !== '' && String(p.categoriaId) !== String(categoriaId)) return false;
    if (min !== '' && precioFinal(p) < Number(min)) return false;
    if (max !== '' && precioFinal(p) > Number(max)) return false;
    return true;
  });
  return ORDENES[orden] ? [...resultado].sort(ORDENES[orden]) : resultado;
}
