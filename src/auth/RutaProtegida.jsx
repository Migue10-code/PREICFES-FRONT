import { Navigate, Outlet } from 'react-router-dom';
import { RUTA_PANEL, useAuth } from './AuthContext';

// Páginas internas: sin sesión van al login; con otro rol van a su propio panel.
export function RutaProtegida({ rol }) {
  const { sesion } = useAuth();
  if (!sesion) return <Navigate to="/login" replace />;
  if (rol && sesion.rol !== rol) return <Navigate to={RUTA_PANEL[sesion.rol]} replace />;
  return <Outlet />;
}

// Login y registro: si ya hay sesión, entrar directo al panel.
export function RutaPublica() {
  const { sesion } = useAuth();
  if (sesion) return <Navigate to={RUTA_PANEL[sesion.rol]} replace />;
  return <Outlet />;
}
