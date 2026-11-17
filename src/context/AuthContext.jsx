import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { desdeApi } from '../data/adaptadores.js';
import { COLECCIONES_PRIVADAS, guardarEnCache, reiniciarDB } from '../data/db.js';
import { EVENTO_SESION_EXPIRADA, api, guardarSesion, leerSesion, mensajeDeError } from '../services/api.js';

/**
 * Sesión del usuario contra auth-service.
 * El token JWT y los datos del usuario se guardan en localStorage ("armatelo:sesion"),
 * así la sesión sobrevive a recargar la página.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(leerSesion);
  const usuario = sesion?.usuario ?? null;

  const abrirSesion = useCallback((respuesta) => {
    const nueva = { token: respuesta.token, usuario: desdeApi.usuarios(respuesta.usuario) };
    guardarSesion(nueva);
    setSesion(nueva);
    reiniciarDB(COLECCIONES_PRIVADAS); // órdenes y usuarios dependen de quién entró
    return nueva.usuario;
  }, []);

  const cerrarSesion = useCallback(() => {
    guardarSesion(null);
    setSesion(null);
    reiniciarDB(COLECCIONES_PRIVADAS);
  }, []);

  // Si el backend responde 401 (token vencido), se cierra la sesión también en la interfaz.
  useEffect(() => {
    const alExpirar = () => {
      setSesion(null);
      reiniciarDB(COLECCIONES_PRIVADAS);
    };
    window.addEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
  }, []);

  // Al abrir la aplicación con una sesión guardada, se actualizan los datos del usuario desde el backend.
  useEffect(() => {
    if (!leerSesion()) return;
    api
      .get('/auth/me')
      .then(({ data }) => {
        const actual = leerSesion();
        if (!actual) return;
        const nueva = { ...actual, usuario: desdeApi.usuarios(data) };
        guardarSesion(nueva);
        setSesion(nueva);
      })
      .catch(() => {
        // sin conexión: se mantiene la sesión guardada; un 401 ya la cerró en el interceptor
      });
  }, []);

  const iniciarSesion = useCallback(
    async (correo, password) => {
      try {
        const { data } = await api.post('/auth/login', { correo: String(correo).trim(), password });
        return { ok: true, usuario: abrirSesion(data) };
      } catch (error) {
        return { ok: false, error: mensajeDeError(error, 'Correo o contraseña incorrectos.') };
      }
    },
    [abrirSesion],
  );

  const registrar = useCallback(
    async (datos) => {
      try {
        const { data } = await api.post('/auth/registro', { ...datos, correo: String(datos.correo).trim().toLowerCase() });
        return { ok: true, usuario: abrirSesion(data) };
      } catch (error) {
        return { ok: false, error: mensajeDeError(error, 'No se pudo crear la cuenta.') };
      }
    },
    [abrirSesion],
  );

  /** Guarda los cambios del propio perfil. Lanza un error si el backend los rechaza. */
  const actualizarPerfil = useCallback(
    async (cambios) => {
      if (!usuario) return null;
      const { data } = await api.put('/usuarios/me', { ...usuario, ...cambios });
      const actualizado = desdeApi.usuarios(data);
      const nueva = { ...leerSesion(), usuario: actualizado };
      guardarSesion(nueva);
      setSesion(nueva);
      if (usuario.rol === 'admin') guardarEnCache('usuarios', actualizado);
      return actualizado;
    },
    [usuario],
  );

  const valor = useMemo(
    () => ({
      usuario,
      esAdmin: usuario?.rol === 'admin',
      iniciarSesion,
      registrar,
      cerrarSesion,
      actualizarPerfil,
    }),
    [usuario, iniciarSesion, registrar, cerrarSesion, actualizarPerfil],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return contexto;
}
