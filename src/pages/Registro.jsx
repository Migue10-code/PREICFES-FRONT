import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorApi, registrarUsuario } from '../api/api';
import { useAuth } from '../auth/AuthContext';
import Burbujas from '../components/Burbujas';
import { useEstilos } from '../hooks/useEstilos';
import { useTitulo } from '../hooks/useTitulo';
import { asset } from '../util/rutas';

const VACIO = {
  nombre: '', apellido: '', grado: '', seccion: '',
  documento: '', nombreUsuario: '', correo: '', clave: '', confirmar: ''
};

export default function Registro() {
  useTitulo('Crear cuenta');
  const listo = useEstilos(['login.css']);
  const { iniciarSesion } = useAuth();

  const [f, setF] = useState(VACIO);
  const [mensaje, setMensaje] = useState('');
  const [exito, setExito] = useState('');
  const [enviando, setEnviando] = useState(false);

  const campo = (nombre) => ({
    value: f[nombre],
    onChange: (e) => setF((v) => ({ ...v, [nombre]: e.target.value }))
  });

  const enviar = async (e) => {
    e.preventDefault();
    setMensaje('');
    setExito('');

    const datos = {
      Nombre: f.nombre.trim(),
      Apellido: f.apellido.trim(),
      Grado: f.grado,
      Seccion: f.seccion,
      DocDeIdentidad: f.documento.trim(),
      NombreUsuario: f.nombreUsuario.trim(),
      Correo: f.correo.trim().toLowerCase(),
      Contraseña: f.clave
    };

    if (Object.values(datos).some((v) => !v)) {
      setMensaje('Completa todos los campos.');
      return;
    }
    if (datos.Contraseña.length < 6) {
      setMensaje('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (datos.Contraseña !== f.confirmar) {
      setMensaje('Las contraseñas no coinciden.');
      return;
    }

    setEnviando(true);
    try {
      const cuerpo = await registrarUsuario(datos);
      setExito('¡Cuenta creada! Entrando…');
      // Entra directo como estudiante (RutaPublica lo lleva al panel)
      setTimeout(() => {
        iniciarSesion({
          rol: 'estudiante',
          nombre: cuerpo.NombreUsuario,
          correo: cuerpo.Correo,
          CodUsuario: cuerpo.CodUsuario
        });
      }, 700);
    } catch (err) {
      if (err instanceof ErrorApi) {
        if (err.status === 409) setMensaje('Ya existe una cuenta con ese correo.');
        else if (err.status === 400) setMensaje(err.cuerpo?.mensaje || 'Revisa los datos del formulario.');
        else setMensaje('No se pudo crear la cuenta por un error del servidor.');
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
          <h2>Crea tu cuenta y empieza a practicar hoy.</h2>
          <p>Regístrate como estudiante para guardar tu progreso en cada simulacro.</p>
        </div>
      </section>

      <main className="acceso">
        <Link className="volver" to="/login">Volver al inicio de sesión</Link>
        <div className="caja ancha">
          <h1>Crear cuenta</h1>
          <p className="sub">Esta cuenta es para estudiantes. Completa tus datos para empezar.</p>

          <form onSubmit={enviar} noValidate>
            <div className="fila-2">
              <div className="campo">
                <label htmlFor="nombre">Nombre</label>
                <input type="text" id="nombre" placeholder="Ej. James" autoComplete="given-name" {...campo('nombre')} />
              </div>
              <div className="campo">
                <label htmlFor="apellido">Apellido</label>
                <input type="text" id="apellido" placeholder="Ej. Rodríguez" autoComplete="family-name" {...campo('apellido')} />
              </div>
            </div>

            <div className="fila-2" style={{ marginTop: 18 }}>
              <div className="campo">
                <label htmlFor="grado">Grado</label>
                <select id="grado" {...campo('grado')}>
                  <option value="">Selecciona tu grado</option>
                  <option value="9">9°</option>
                  <option value="10">10°</option>
                  <option value="11">11°</option>
                </select>
              </div>
              <div className="campo">
                <label htmlFor="seccion">Sección</label>
                <select id="seccion" {...campo('seccion')}>
                  <option value="">Selecciona</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="campo" style={{ marginTop: 18 }}>
              <label htmlFor="documento">Número de documento</label>
              <input type="text" id="documento" placeholder="Ej. 1020304050" inputMode="numeric" autoComplete="off" {...campo('documento')} />
            </div>

            <div className="campo">
              <label htmlFor="nombreUsuario">Nombre de usuario</label>
              <input type="text" id="nombreUsuario" placeholder="Ej. jamesr123" autoComplete="username" {...campo('nombreUsuario')} />
            </div>

            <div className="campo">
              <label htmlFor="correo">Correo</label>
              <input type="email" id="correo" placeholder="correo@ejemplo.com" autoComplete="email" {...campo('correo')} />
            </div>

            <div className="fila-2">
              <div className="campo">
                <label htmlFor="clave">Contraseña</label>
                <input type="password" id="clave" placeholder="Mínimo 6 caracteres" autoComplete="new-password" {...campo('clave')} />
              </div>
              <div className="campo">
                <label htmlFor="confirmar">Confirmar contraseña</label>
                <input type="password" id="confirmar" placeholder="Repite la contraseña" autoComplete="new-password" {...campo('confirmar')} />
              </div>
            </div>
            <p className="ayuda" style={{ marginTop: 8 }}>La contraseña debe tener al menos 6 caracteres.</p>

            <p id="mensaje" className="error" role="alert">{mensaje}</p>
            <p id="exito" className="exito" role="status">{exito}</p>
            <button type="submit" className="entrar" disabled={enviando}>
              {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>
        </div>
        <p className="pie">PREICFES, preparación para el examen Saber 11.</p>
      </main>
    </div>
  );
}
