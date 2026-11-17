// Punto de entrada de Karma: carga todos los archivos *.spec.js y *.spec.jsx de src/.
// Las pruebas no llaman al backend real: axios responde con un backend falso en memoria.
require('../src/test/servidorFalso.js').instalarServidorFalso();

const contexto = require.context('../src', true, /\.spec\.jsx?$/);
contexto.keys().forEach(contexto);
