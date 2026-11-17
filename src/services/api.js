// Cliente HTTP del backend (API Gateway de los microservicios).
// Todas las llamadas del frontend pasan por aquí: agrega el token JWT y traduce los errores.
import axios from 'axios';

/** URL del API Gateway. Se puede cambiar sin recompilar definiendo window.ARMATELO_API_URL antes de cargar la app. */
export const URL_API = (typeof window !== 'undefined' && window.ARMATELO_API_URL) || 'http://localhost:9090/api/v1';

export const api = axios.create({ baseURL: URL_API, timeout: 15000 });

// ---------- Sesión (token JWT + datos del usuario) ----------

const CLAVE_SESION = 'armatelo:sesion';
export const EVENTO_SESION_EXPIRADA = 'armatelo:sesion-expirada';

/** Devuelve { token, usuario } o null si no hay sesión. */
export function leerSesion() {
  try {
    const crudo = window.localStorage.getItem(CLAVE_SESION);
    const sesion = crudo ? JSON.parse(crudo) : null;
    return sesion && sesion.token ? sesion : null;
  } catch {
    return null;
  }
}

export function guardarSesion(sesion) {
  try {
    if (!sesion) window.localStorage.removeItem(CLAVE_SESION);
    else window.localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  } catch {
    // sin almacenamiento disponible: la sesión dura solo mientras la pestaña está abierta
  }
}

// Agrega "Authorization: Bearer <token>" a cada petición.
api.interceptors.request.use((config) => {
  const token = leerSesion()?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si el token venció o es inválido (401), se cierra la sesión en el navegador.
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const conToken = Boolean(error.config?.headers?.Authorization);
    if (error.response?.status === 401 && conToken) {
      guardarSesion(null);
      window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
    }
    return Promise.reject(error);
  },
);

/**
 * Convierte un error de la API en un texto para mostrar.
 * El backend responde { mensaje, campos: { campo: 'error' } }.
 */
export function mensajeDeError(error, porDefecto = 'Ocurrió un error. Intenta nuevamente.') {
  if (!error?.response) {
    return 'No se pudo conectar con el servidor. Verifica que el backend esté levantado.';
  }
  const datos = error.response.data ?? {};
  const primerCampo = datos.campos && Object.values(datos.campos)[0];
  return primerCampo || datos.mensaje || porDefecto;
}
