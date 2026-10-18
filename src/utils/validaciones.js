// Funciones de validación reutilizables. Devuelven un texto de error o '' si el valor es válido.
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD = 8;

/** `objeto` lleva su artículo ("el nombre", "la calle") para que la frase quede bien escrita. */
export function validarRequerido(valor, objeto = 'este dato', verbo = 'Ingresa') {
  return String(valor ?? '').trim().length > 0 ? '' : `${verbo} ${objeto}.`;
}

export function validarEmail(valor) {
  const texto = String(valor ?? '').trim();
  if (!texto) return 'Ingresa tu correo electrónico.';
  return EMAIL_REGEX.test(texto) ? '' : 'Ingresa un correo válido.';
}

export function validarPassword(valor) {
  return String(valor ?? '').length >= MIN_PASSWORD
    ? ''
    : `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`;
}

export function validarConfirmacion(password, confirmacion) {
  if (!confirmacion) return 'Confirma tu contraseña.';
  return password === confirmacion ? '' : 'Las contraseñas no coinciden.';
}

export function validarNumeroPositivo(valor, etiqueta = 'Este campo') {
  if (String(valor ?? '').trim() === '') return `${etiqueta} es obligatorio.`;
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero < 0) return `${etiqueta} debe ser un número igual o mayor a 0.`;
  return '';
}

/** Recibe { campo: mensaje } y dice si no hay ningún error. */
export function sinErrores(errores) {
  return Object.values(errores).every((mensaje) => !mensaje);
}
