const fs = require('fs');

// Si no hay un Chrome configurado y existe el Chromium del entorno, se usa ese.
if (!process.env.CHROME_BIN && fs.existsSync('/opt/pw-browsers/chromium')) {
  process.env.CHROME_BIN = '/opt/pw-browsers/chromium';
}
process.env.BABEL_ENV = 'test';

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'webpack'],
    plugins: [
      'karma-jasmine',
      'karma-webpack',
      'karma-chrome-launcher',
      'karma-coverage',
      'karma-spec-reporter',
    ],
    files: ['test/index.cjs'],
    preprocessors: { 'test/index.cjs': ['webpack'] },
    webpack: {
      mode: 'development',
      devtool: false,
      module: {
        rules: [
          {
            test: /\.m?jsx?$/,
            exclude: /node_modules/,
            resolve: { fullySpecified: false },
            use: 'babel-loader',
          },
        ],
      },
      resolve: { extensions: ['.js', '.jsx'] },
    },
    reporters: ['spec', 'coverage'],
    specReporter: { suppressSkipped: true, showSpecTiming: true },
    coverageReporter: {
      dir: 'coverage',
      reporters: [{ type: 'html', subdir: 'html' }, { type: 'text-summary' }, { type: 'json-summary', subdir: '.', file: 'resumen.json' }],
    },
    browsers: ['ChromeHeadlessCI'],
    customLaunchers: {
      ChromeHeadlessCI: { base: 'ChromeHeadless', flags: ['--no-sandbox', '--disable-gpu'] },
    },
    client: { jasmine: { random: true } },
    singleRun: true,
    restartOnFileChange: true,
  });
};
