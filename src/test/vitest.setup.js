// Puente para correr con Vitest las mismas pruebas escritas con la API de Jasmine.
// Karma usa Jasmine de verdad; este archivo solo se carga cuando se ejecuta `npm run test:vitest`.
import { expect, vi } from 'vitest';

expect.extend({
  toBeTrue(recibido) {
    return { pass: recibido === true, message: () => `se esperaba true y llegó ${String(recibido)}` };
  },
  toBeFalse(recibido) {
    return { pass: recibido === false, message: () => `se esperaba false y llegó ${String(recibido)}` };
  },
});

globalThis.jasmine = { createSpy: () => vi.fn() };

globalThis.spyOn = (objeto, metodo) => {
  const espia = vi.spyOn(objeto, metodo);
  espia.and = { returnValue: (valor) => espia.mockReturnValue(valor) && espia };
  return espia;
};

// jsdom no implementa scrollTo; se deja vacío para no llenar la consola de avisos.
window.scrollTo = () => {};
