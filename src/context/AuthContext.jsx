import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { actualizar, crear, listar } from '../data/db.js';
import { useColeccion } from '../data/useColeccion.js';

const CLAVE_SESION = 'armatelo:sesion';

function leerSesion() {
  try {
    return window.localStorage.getItem(CLAVE_SESION);
  } catch {
    return null;
  }
}

function guardarSesion(id) {
  try {
    if (id === null) window.localStorage.removeItem(CLAVE_SESION);
    else window.localStorage.setItem(CLAVE_SESION, String(id));
  } catch {
    // sin almacenamiento disponible
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const usuarios = useColeccion('usuarios');
  const [sesionId, setSesionId] = useState(leerSesion);

  const usuario = useMemo(
    () => usuarios.find((u) => String(u.id) === String(sesionId)) ?? null,
    [usuarios, sesionId],
  );

  const iniciarSesion = useCallback((correo, password) => {
    const encontrado = listar('usuarios').find(
      (u) => u.correo.toLowerCase() === String(correo).trim().toLowerCase() && u.password === password,
    );
    if (!encontrado) return { ok: false, error: 'Correo o contraseña incorrectos.' };
    guardarSesion(encontrado.id);
    setSesionId(String(encontrado.id));
    return { ok: true, usuario: encontrado };
  }, []);

  const registrar = useCallback((datos) => {
    const correo = String(datos.correo).trim().toLowerCase();
    if (listar('usuarios').some((u) => u.correo.toLowerCase() === correo)) {
      return { ok: false, error: 'Ya existe una cuenta con ese correo.' };
    }
    const nuevo = crear('usuarios', {
      telefono: '',
      region: '',
      comuna: '',
      calle: '',
      departamento: '',
      ...datos,
      correo,
      rol: 'cliente',
    });
    guardarSesion(nuevo.id);
    setSesionId(String(nuevo.id));
    return { ok: true, usuario: nuevo };
  }, []);

  const cerrarSesion = useCallback(() => {
    guardarSesion(null);
    setSesionId(null);
  }, []);

  const actualizarPerfil = useCallback((cambios) => {
    if (!sesionId) return null;
    return actualizar('usuarios', sesionId, cambios);
  }, [sesionId]);

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
