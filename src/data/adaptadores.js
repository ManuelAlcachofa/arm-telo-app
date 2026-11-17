// Traduce los datos entre el formato del backend y el formato que ya usaba el frontend
// Así los componentes siguen trabajando con los mismos campos de siempre
//  - El frontend usa '' para "sin oferta" / "stock por definir", el backend usa null.
//  - Las ordenes del frontend usan `entregaId`; el backend responde `entrega`.

const vacioSiNulo = (valor) => (valor === null || valor === undefined ? '' : valor);
const nuloSiVacio = (valor) => (valor === '' || valor === null || valor === undefined ? null : valor);
const numeroONulo = (valor) => (nuloSiVacio(valor) === null ? null : Number(valor));

/** Backend → frontend */
export const desdeApi = {
  productos: (p) => ({
    ...p,
    marca: vacioSiNulo(p.marca),
    descripcion: vacioSiNulo(p.descripcion),
    precioOferta: vacioSiNulo(p.precioOferta),
    stock: vacioSiNulo(p.stock),
    imagen: vacioSiNulo(p.imagen),
  }),
  categorias: (c) => ({ ...c, descripcion: vacioSiNulo(c.descripcion), icono: c.icono || 'bi-tag' }),
  usuarios: (u) => ({
    ...u,
    telefono: vacioSiNulo(u.telefono),
    region: vacioSiNulo(u.region),
    comuna: vacioSiNulo(u.comuna),
    calle: vacioSiNulo(u.calle),
    departamento: vacioSiNulo(u.departamento),
  }),
  ordenes: (o) => ({ ...o, entregaId: o.entrega, direccion: o.direccion ?? {}, motivo: vacioSiNulo(o.motivo) }),
  mensajes: (m) => m,
};

/** Frontend → backend (cuerpo de POST / PUT) */
export const haciaApi = {
  productos: (d) => ({
    nombre: d.nombre,
    marca: nuloSiVacio(d.marca),
    descripcion: nuloSiVacio(d.descripcion),
    categoriaId: numeroONulo(d.categoriaId),
    precio: numeroONulo(d.precio),
    precioOferta: numeroONulo(d.precioOferta),
    stock: numeroONulo(d.stock),
    stockCritico: numeroONulo(d.stockCritico),
    imagen: nuloSiVacio(d.imagen),
  }),
  categorias: (d) => ({ nombre: d.nombre, descripcion: nuloSiVacio(d.descripcion), icono: nuloSiVacio(d.icono) }),
  usuarios: (d) => ({
    nombre: d.nombre,
    apellidos: d.apellidos,
    correo: d.correo,
    rol: d.rol,
    password: nuloSiVacio(d.password),
    telefono: nuloSiVacio(d.telefono),
    region: nuloSiVacio(d.region),
    comuna: nuloSiVacio(d.comuna),
    calle: nuloSiVacio(d.calle),
    departamento: nuloSiVacio(d.departamento),
  }),
  mensajes: (d) => ({ nombre: d.nombre, correo: d.correo, asunto: d.asunto, mensaje: d.mensaje }),
};
