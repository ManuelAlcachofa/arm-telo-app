// Configuración de Babel usada solo por Karma/Webpack (Vite usa su propio plugin de React).
module.exports = (api) => {
  const esTest = api.env('test');
  return {
    presets: [
      ['@babel/preset-env', { targets: { chrome: '100' } }],
      ['@babel/preset-react', { runtime: 'automatic' }],
    ],
    // En test se instrumenta el código para medir la cobertura.
    plugins: esTest
      ? [['istanbul', { exclude: ['**/*.spec.jsx', '**/*.spec.js', 'test/**', 'src/test/**', 'src/main.jsx'] }]]
      : [],
  };
};
