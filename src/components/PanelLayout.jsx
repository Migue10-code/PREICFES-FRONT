import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useEstilos } from '../hooks/useEstilos';
import { asset } from '../util/rutas';
import Chatbot from './Chatbot';
import { IconoCasa, IconoGrafico } from './iconos';

// Menú lateral de cada rol. Los grupos con "items" se abren y cierran.
const MENU = {
  estudiante: [
    { titulo: 'Inicio', ruta: '/estudiante', icono: <IconoCasa />, exacta: true },
    {
      titulo: 'Realizar Simulacro',
      ruta: '/estudiante/simulacro?modo=aleatorio',
      activaEn: '/estudiante/simulacro',
      icono: <IconoGrafico />
    },
    { titulo: 'Mi historial', ruta: '/estudiante/historial', icono: <IconoGrafico /> }
  ],
  administrador: [
    { titulo: 'Menu Principal', ruta: '/admin', icono: <IconoCasa />, exacta: true },
    {
      titulo: 'Registro',
      icono: <IconoGrafico />,
      items: [
        { titulo: 'Estudiantes', ruta: '/admin/estudiantes' },
        { titulo: 'Usuarios', ruta: '/admin/usuarios' }
      ]
    },
    {
      titulo: 'Crear Simulacro',
      icono: <IconoGrafico />,
      items: [{ titulo: 'Crear Simulacro', ruta: '/admin/simulacros' }]
    },
    {
      titulo: 'Nuevos Temas y Preguntas',
      icono: <IconoGrafico />,
      items: [
        { titulo: 'Agregar Tema', ruta: '/admin/temas' },
        { titulo: 'Crear Pregunta', ruta: '/admin/preguntas' }
      ]
    }
  ]
};

const ETIQUETA_ROL = { estudiante: 'Estudiante', administrador: 'Administrador' };

function GrupoMenu({ grupo, pathname }) {
  const contieneRutaActual = grupo.items.some((i) => i.ruta === pathname);
  const [abierto, setAbierto] = useState(contieneRutaActual);

  useEffect(() => {
    if (contieneRutaActual) setAbierto(true);
  }, [contieneRutaActual]);

  return (
    <li className={`nav-item nav-item-has-children${contieneRutaActual ? ' active' : ''}`}>
      <a
        href="#0"
        className={abierto ? '' : 'collapsed'}
        aria-expanded={abierto}
        onClick={(e) => {
          e.preventDefault();
          setAbierto((v) => !v);
        }}
      >
        <span className="icon">{grupo.icono}</span>
        <span className="text">{grupo.titulo}</span>
      </a>
      <ul className={`collapse dropdown-nav${abierto ? ' show' : ''}`}>
        {grupo.items.map((item) => (
          <li key={item.ruta}>
            <Link to={item.ruta} className={item.ruta === pathname ? 'active' : ''}>
              {item.titulo}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}

// Estructura común de los paneles (estudiante y administrador):
// menú lateral + barra superior + contenido de la página (<Outlet />) + pie.
export default function PanelLayout({ rol }) {
  const listo = useEstilos([
    'bootstrap.min.css',
    'lineicons.css',
    'materialdesignicons.min.css',
    'main.css',
    'inicio.css',
    'chat.css'
  ]);
  const { sesion, cerrarSesion } = useAuth();
  const { pathname } = useLocation();
  const navegar = useNavigate();

  const [lateralCerrado, setLateralCerrado] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const cajaPerfil = useRef(null);

  const inicio = rol === 'estudiante' ? '/estudiante' : '/admin';

  // Cerrar el menú de perfil al hacer clic afuera o al cambiar de página
  useEffect(() => {
    if (!perfilAbierto) return undefined;
    const alClic = (e) => {
      if (cajaPerfil.current && !cajaPerfil.current.contains(e.target)) setPerfilAbierto(false);
    };
    document.addEventListener('mousedown', alClic);
    return () => document.removeEventListener('mousedown', alClic);
  }, [perfilAbierto]);

  useEffect(() => {
    setPerfilAbierto(false);
  }, [pathname]);

  const salir = (e) => {
    e.preventDefault();
    cerrarSesion();
    navegar('/login', { replace: true });
  };

  if (!listo) return null;

  const nombre = sesion?.nombre || (rol === 'estudiante' ? 'Usuario' : 'Admin');

  return (
    <>
      <aside className={`sidebar-nav-wrapper${lateralCerrado ? ' active' : ''}`}>
        <div className="navbar-logo">
          <Link to={inicio}>
            <img
              src={asset('images/logo/preicfes.svg')}
              alt="PREICFES"
              height="34"
              style={{ height: 34, width: 'auto' }}
            />
          </Link>
        </div>
        <nav className="sidebar-nav">
          <ul>
            {MENU[rol].map((item) => {
              if (item.items) return <GrupoMenu key={item.titulo} grupo={item} pathname={pathname} />;
              const base = item.activaEn || item.ruta;
              const activo = item.exacta ? pathname === base : pathname.startsWith(base);
              return (
                <li key={item.titulo} className={`nav-item${activo ? ' active' : ''}`}>
                  <Link to={item.ruta}>
                    <span className="icon">{item.icono}</span>
                    <span className="text">{item.titulo}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
      <div
        className={`overlay${lateralCerrado ? ' active' : ''}`}
        onClick={() => setLateralCerrado(false)}
      />

      <main className={`main-wrapper${lateralCerrado ? ' active' : ''}`}>
        <header className="header">
          <div className="container-fluid">
            <div className="row">
              <div className="col-lg-5 col-md-5 col-6">
                <div className="header-left d-flex align-items-center">
                  <div className="menu-toggle-btn mr-15">
                    <button
                      id="menu-toggle"
                      type="button"
                      className="main-btn primary-btn btn-hover"
                      onClick={() => setLateralCerrado((v) => !v)}
                    >
                      <i className={`lni ${lateralCerrado ? 'lni-menu' : 'lni-chevron-left'} me-2`}></i> Menu
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-lg-7 col-md-7 col-6">
                <div className="header-right">
                  <div className="profile-box ml-15" ref={cajaPerfil} style={{ position: 'relative' }}>
                    <button
                      className="dropdown-toggle bg-transparent border-0"
                      type="button"
                      id="profile"
                      aria-expanded={perfilAbierto}
                      onClick={() => setPerfilAbierto((v) => !v)}
                    >
                      <div className="profile-info">
                        <div className="info">
                          <div className="image">
                            <img src={asset('images/profile/profile-image.png')} alt="" />
                          </div>
                          <div>
                            <h6 className="fw-500">{nombre}</h6>
                            <p>{ETIQUETA_ROL[rol]}</p>
                          </div>
                        </div>
                      </div>
                    </button>
                    <ul
                      className={`dropdown-menu dropdown-menu-end${perfilAbierto ? ' show' : ''}`}
                      data-bs-popper={perfilAbierto ? 'static' : undefined}
                      aria-labelledby="profile"
                    >
                      <li>
                        <div className="author-info flex items-center !p-1">
                          <div className="image">
                            <img src={asset('images/profile/profile-image.png')} alt="" />
                          </div>
                          <div className="content">
                            <h4 className="text-sm">{nombre}</h4>
                            {sesion?.correo && <span className="text-xs">{sesion.correo}</span>}
                          </div>
                        </div>
                      </li>
                      <li className="divider"></li>
                      <li>
                        <a href="#0" onClick={salir}>
                          <i className="lni lni-exit"></i> Cerrar sesión
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <Outlet />

        <footer className="footer">
          <div className="container-fluid">
            <p className="text-sm">PREICFES &copy; 2025</p>
          </div>
        </footer>
      </main>

      {rol === 'estudiante' && <Chatbot />}
    </>
  );
}
