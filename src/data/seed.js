// Datos iniciales de la "base de datos" simulada.
//
// PRODUCTOS: la lista parte VACÍA a propósito. Puedes cargarlos de dos formas:
//   1) Desde el panel de administrador (menú Productos > Nuevo producto).
//   2) Agregándolos aquí abajo, dentro del arreglo `productos`, con este formato:
//
//   {
//     id: 1,
//     nombre: 'Ryzen 5 5600',
//     descripcion: 'Procesador de 6 núcleos y 12 hilos.',
//     marca: 'AMD',
//     categoriaId: 1,          // id de una categoría (ver más abajo)
//     precio: 129990,          // en pesos chilenos
//     precioOferta: '',        // déjalo vacío si no está en oferta
//     stock: '',               // déjalo vacío si aún no defines el stock
//     stockCritico: 5,         // bajo este número aparece en "Productos críticos"
//     imagen: '',              // URL de una imagen (opcional)
//   }
//
// Si cambias este archivo después de haber abierto el sitio, usa en la consola del navegador
// localStorage.clear() y recarga para que se vuelvan a leer los datos iniciales.

export const SEMILLAS = {
  productos: [],

  categorias: [
    { id: 1, nombre: 'Procesadores', descripcion: 'CPU AMD y Intel para todo presupuesto.', icono: 'bi-cpu' },
    { id: 2, nombre: 'Tarjetas de video', descripcion: 'GPU para juegos, diseño y trabajo.', icono: 'bi-gpu-card' },
    { id: 3, nombre: 'Memoria RAM', descripcion: 'Módulos DDR4 y DDR5.', icono: 'bi-memory' },
    { id: 4, nombre: 'Almacenamiento', descripcion: 'SSD, discos duros y unidades NVMe.', icono: 'bi-device-ssd' },
    { id: 5, nombre: 'Placas madre', descripcion: 'Placas para plataformas AMD e Intel.', icono: 'bi-motherboard' },
    { id: 6, nombre: 'Fuentes de poder', descripcion: 'Fuentes certificadas de distintas potencias.', icono: 'bi-lightning-charge' },
    { id: 7, nombre: 'Gabinetes', descripcion: 'Gabinetes con buen flujo de aire.', icono: 'bi-pc' },
    { id: 8, nombre: 'Periféricos', descripcion: 'Teclados, mouse, audífonos y monitores.', icono: 'bi-keyboard' },
  ],

  // Cuenta de administrador de prueba (solo existe en el navegador, es una simulación).
  usuarios: [
    {
      id: 1,
      nombre: 'Administrador',
      apellidos: 'Armatelo',
      correo: 'admin@armatelo.cl',
      password: 'Admin1234',
      rol: 'admin',
      telefono: '',
      region: '',
      comuna: '',
      calle: '',
      departamento: '',
    },
  ],

  ordenes: [],
  mensajes: [],
};
