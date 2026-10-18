import { sinErrores, validarConfirmacion, validarEmail, validarNumeroPositivo, validarPassword, validarRequerido } from './validaciones.js';

describe('utils/validaciones', () => {
  it('exige un valor en los campos obligatorios', () => {
    expect(validarRequerido('   ', 'el nombre')).toBe('Ingresa el nombre.');
    expect(validarRequerido('', 'una región', 'Selecciona')).toBe('Selecciona una región.');
    expect(validarRequerido('Ana', 'el nombre')).toBe('');
  });

  it('valida el formato del correo', () => {
    expect(validarEmail('')).toBe('Ingresa tu correo electrónico.');
    expect(validarEmail('correo-sin-arroba')).toBe('Ingresa un correo válido.');
    expect(validarEmail('ana@correo.cl')).toBe('');
  });

  it('pide al menos 8 caracteres en la contraseña', () => {
    expect(validarPassword('1234567')).toContain('al menos 8');
    expect(validarPassword('12345678')).toBe('');
  });

  it('comprueba que las contraseñas coincidan', () => {
    expect(validarConfirmacion('abcdefgh', '')).toBe('Confirma tu contraseña.');
    expect(validarConfirmacion('abcdefgh', 'abcdefgx')).toBe('Las contraseñas no coinciden.');
    expect(validarConfirmacion('abcdefgh', 'abcdefgh')).toBe('');
  });

  it('acepta números iguales o mayores a 0 y rechaza el resto', () => {
    expect(validarNumeroPositivo('', 'El precio')).toBe('El precio es obligatorio.');
    expect(validarNumeroPositivo('-3', 'El precio')).toContain('igual o mayor a 0');
    expect(validarNumeroPositivo('0', 'El precio')).toBe('');
  });

  it('sinErrores indica si todos los mensajes están vacíos', () => {
    expect(sinErrores({ a: '', b: '' })).toBeTrue();
    expect(sinErrores({ a: '', b: 'Falta' })).toBeFalse();
  });
});
