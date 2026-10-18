// Punto de entrada de Karma: carga todos los archivos *.spec.js y *.spec.jsx de src/.
const contexto = require.context('../src', true, /\.spec\.jsx?$/);
contexto.keys().forEach(contexto);
