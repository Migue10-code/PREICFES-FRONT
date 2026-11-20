import { createContext, useCallback, useContext, useMemo, useState } from 'react';

// Pantalla de inicio de cada rol
export const RUTA_PANEL = {
  administrador: '/admin',
  estudiante: '/estudiante'
};

const Contexto = createContext(null);

// La sesión se guarda como antes: { rol, nombre, correo, CodUsuario }
// en sessionStorage (o en localStorage si marcó "Mantener la sesión iniciada").
function leerSesion() {
  try {
    const guardada = JSON.parse(
      sessionStorage.getItem('sesion') || localStorage.getItem('sesion') || 'null'
    );
    return guardada && RUTA_PANEL[guardada.rol] ? guardada : null;
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(leerSesion);

  const iniciarSesion = useCallback((datos, recordar = false) => {
    sessionStorage.removeItem('sesion');
    localStorage.removeItem('sesion');
    (recordar ? localStorage : sessionStorage).setItem('sesion', JSON.stringify(datos));
    setSesion(datos);
  }, []);

  const cerrarSesion = useCallback(() => {
    sessionStorage.removeItem('sesion');
    localStorage.removeItem('sesion');
    setSesion(null);
  }, []);

  const valor = useMemo(
    () => ({ sesion, iniciarSesion, cerrarSesion }),
    [sesion, iniciarSesion, cerrarSesion]
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAuth() {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return valor;
}
