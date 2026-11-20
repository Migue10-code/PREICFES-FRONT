import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { RutaProtegida, RutaPublica } from './auth/RutaProtegida';
import PanelLayout from './components/PanelLayout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Registro from './pages/Registro';

import EstudianteInicio from './pages/estudiante/Inicio';
import Simulacro from './pages/estudiante/Simulacro';
import Historial from './pages/estudiante/Historial';

import AdminInicio from './pages/admin/Inicio';
import Estudiantes from './pages/admin/Estudiantes';
import Usuarios from './pages/admin/Usuarios';
import Temas from './pages/admin/Temas';
import Preguntas from './pages/admin/Preguntas';
import Simulacros from './pages/admin/Simulacros';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route element={<RutaPublica />}>
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
          </Route>

          <Route path="/estudiante" element={<RutaProtegida rol="estudiante" />}>
            <Route element={<PanelLayout rol="estudiante" />}>
              <Route index element={<EstudianteInicio />} />
              <Route path="simulacro" element={<Simulacro />} />
              <Route path="historial" element={<Historial />} />
            </Route>
          </Route>

          <Route path="/admin" element={<RutaProtegida rol="administrador" />}>
            <Route element={<PanelLayout rol="administrador" />}>
              <Route index element={<AdminInicio />} />
              <Route path="estudiantes" element={<Estudiantes />} />
              <Route path="usuarios" element={<Usuarios />} />
              <Route path="temas" element={<Temas />} />
              <Route path="preguntas" element={<Preguntas />} />
              <Route path="simulacros" element={<Simulacros />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
