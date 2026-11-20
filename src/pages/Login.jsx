import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorApi, loginUsuario } from '../api/api';
import { useAuth } from '../auth/AuthContext';
import Burbujas from '../components/Burbujas';
import { useEstilos } from '../hooks/useEstilos';
import { useTitulo } from '../hooks/useTitulo';
import { asset } from '../util/rutas';
import { normalizarRol } from '../util/texto';

export default function Login() {
  useTitulo('Iniciar sesión');
  const listo = useEstilos(['login.css']);
  const { iniciarSesion } = useAuth();

  const [rol, setRol] = useState('estudiante');
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [verClave, setVerClave] = useState(false);
  const [recordar, setRecordar] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setMensaje('');
    const correoLimpio = correo.trim().toLowerCase();
    if (!correoLimpio || !clave) {
      setMensaje('Escribe tu correo y tu contraseña.');
      return;
    }
    setEnviando(true);
    try {
      const usuario = await loginUsuario(correoLimpio, clave, rol);
      const rolAutorizado = normalizarRol(usuario.Rol);
      if (!rolAutorizado || rolAutorizado !== rol) {
        setMensaje('El servidor no confirmó el rol de esta cuenta.');
        return;
      }
      // Al guardar la sesión, RutaPublica redirige al panel del rol
      iniciarSesion(
        {
          rol: rolAutorizado,
          nombre: usuario.NombreUsuario,
          correo: usuario.Correo,
          CodUsuario: usuario.CodUsuario
        },
        recordar
      );
    } catch (err) {
      if (err instanceof ErrorApi) {
        if (err.status === 403) setMensaje('El rol seleccionado no corresponde a esta cuenta.');
        else if (err.status === 401) setMensaje('Correo o contraseña incorrectos.');
        else if (err.status === 400) setMensaje('Completa el correo, la contraseña y el rol.');
        else setMensaje('No se pudo iniciar sesión por un error del servidor.');
      } else {
        setMensaje('No se pudo conectar con el servidor.');
      }
    } finally {
      setEnviando(false);
    }
  };

  if (!listo) return null;

  return (
    <div className="pagina">
      <section className="arte" aria-label="PREICFES">
        <Burbujas />
        <Link className="logo-enlace" to="/" aria-label="PREICFES, ir al inicio">
          <img className="logo" src={asset('images/logo/preicfes-blanco.svg')} alt="PREICFES" />
        </Link>
        <div className="mensaje">
          <h2>Cada respuesta te acerca a tu mejor puntaje.</h2>
          <p>Practica con simulacros del examen Saber 11 y mide tu avance en cada área.</p>
        </div>
      </section>

      <main className="acceso">
        <Link className="volver" to="/">Volver al inicio</Link>
        <div className="caja">
          <h1>Bienvenido de nuevo</h1>
          <p className="sub">Elige cómo vas a entrar y escribe tus datos.</p>

          <form onSubmit={enviar} noValidate>
            <fieldset>
              <legend>Ingresar como</legend>
              <div className="roles">
                <label className="rol">
                  <input
                    type="radio"
                    name="rol"
                    value="estudiante"
                    checked={rol === 'estudiante'}
                    onChange={() => setRol('estudiante')}
                  />
                  <span className="opcion">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 10 12 5 2 10l10 5 10-5z" /><path d="M6 12v5c3 2 9 2 12 0v-5" /></svg>
                    Estudiante
                    <span className="punto"></span>
                  </span>
                </label>
                <label className="rol">
                  <input
                    type="radio"
                    name="rol"
                    value="administrador"
                    checked={rol === 'administrador'}
                    onChange={() => setRol('administrador')}
                  />
                  <span className="opcion">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z" /><path d="m9 12 2 2 4-4" /></svg>
                    Administrador
                    <span className="punto"></span>
                  </span>
                </label>
              </div>
            </fieldset>

            <div className="campo">
              <label htmlFor="correo">Correo</label>
              <input
                type="email"
                id="correo"
                placeholder="correo@ejemplo.com"
                autoComplete="username"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
            </div>

            <div className="campo">
              <label htmlFor="clave">Contraseña</label>
              <div className="clave-wrap">
                <input
                  type={verClave ? 'text' : 'password'}
                  id="clave"
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                />
                <button
                  type="button"
                  id="verClave"
                  className="ver"
                  aria-pressed={verClave}
                  onClick={() => setVerClave((v) => !v)}
                >
                  {verClave ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            <label className="recordar">
              <input type="checkbox" id="recordar" checked={recordar} onChange={(e) => setRecordar(e.target.checked)} />
              Mantener la sesión iniciada
            </label>

            <p id="mensaje" className="error" role="alert">{mensaje}</p>
            <button type="submit" className="entrar" disabled={enviando}>
              {enviando ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
          <p className="crear-cuenta">¿Aún no tienes cuenta? <Link to="/registro">Regístrate</Link></p>
        </div>
        <p className="pie">PREICFES, preparación para el examen Saber 11.</p>
      </main>
    </div>
  );
}
