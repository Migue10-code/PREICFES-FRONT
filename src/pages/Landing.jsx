import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RUTA_PANEL, useAuth } from '../auth/AuthContext';
import { useEstilos } from '../hooks/useEstilos';
import { asset } from '../util/rutas';

const PREGUNTAS = [
  {
    materia: 'Lectura Crítica', icono: 'mdi-book-open-variant',
    pregunta: '“Aunque el cielo estaba despejado, María llevó el paraguas porque el noticiero había anunciado lluvias para la tarde.” ¿Por qué llevó María el paraguas?',
    opciones: ['Porque el cielo estaba nublado', 'Por una recomendación del noticiero sobre el clima de la tarde', 'Porque siempre lleva paraguas', 'Porque alguien se lo pidió'],
    correcta: 1
  },
  {
    materia: 'Matemáticas', icono: 'mdi-calculator-variant',
    pregunta: 'Un simulacro tiene 40 preguntas. Si un estudiante responde correctamente el 75 %, ¿cuántas preguntas acertó?',
    opciones: ['25', '28', '30', '32'],
    correcta: 2
  },
  {
    materia: 'Sociales y Ciudadanas', icono: 'mdi-earth',
    pregunta: '¿Cuántas ramas del poder público tiene el Estado colombiano?',
    opciones: ['Dos', 'Tres', 'Cuatro', 'Cinco'],
    correcta: 1
  },
  {
    materia: 'Ciencias Naturales', icono: 'mdi-flask',
    pregunta: 'Durante la fotosíntesis, las plantas toman dióxido de carbono y liberan principalmente:',
    opciones: ['Nitrógeno', 'Hidrógeno', 'Oxígeno', 'Dióxido de azufre'],
    correcta: 2
  },
  {
    materia: 'Inglés', icono: 'mdi-translate',
    pregunta: 'Choose the correct option: “She ___ to school every day.”',
    opciones: ['go', 'goes', 'going', 'gone'],
    correcta: 1
  }
];

const SECCIONES = [
  { id: 'nosotros', texto: 'Nosotros' },
  { id: 'reto', texto: 'Ponte a prueba' },
  { id: 'como-funciona', texto: 'Cómo funciona' }
];

function BotonEntrar({ clase, sesion }) {
  return sesion ? (
    <Link className={clase} to={RUTA_PANEL[sesion.rol]}>Ir a mi panel</Link>
  ) : (
    <Link className={clase} to="/login">Iniciar sesión</Link>
  );
}

function MiniReto({ sesion }) {
  const [indice, setIndice] = useState(0);
  const [elegida, setElegida] = useState(null);
  const [aciertos, setAciertos] = useState(0);
  const [terminado, setTerminado] = useState(false);

  const elegir = (i) => {
    if (elegida !== null) return;
    setElegida(i);
    if (i === PREGUNTAS[indice].correcta) setAciertos((a) => a + 1);
  };

  const siguiente = () => {
    if (indice + 1 < PREGUNTAS.length) {
      setIndice(indice + 1);
      setElegida(null);
    } else {
      setTerminado(true);
    }
  };

  const repetir = () => {
    setIndice(0);
    setElegida(null);
    setAciertos(0);
    setTerminado(false);
  };

  if (terminado) {
    const mensaje =
      aciertos === PREGUNTAS.length ? '¡Las 5 correctas! Vas muy bien preparado.'
      : aciertos >= 3 ? 'Buen resultado. Con más práctica puedes mejorar aún más.'
      : 'Este fue solo un abrebocas. Con simulacros completos puedes reforzar cada área.';
    return (
      <div className="reto-tarjeta reto-resultado">
        <div className="aro"><strong>{aciertos}/{PREGUNTAS.length}</strong><small>ACIERTOS</small></div>
        <h3>{mensaje}</h3>
        <p>Este mini reto solo probó una pregunta por área. Inicia sesión para hacer simulacros completos y ver tu progreso.</p>
        <div className="cta">
          <BotonEntrar clase="boton boton-primario" sesion={sesion} />
          <button type="button" className="boton boton-secundario" onClick={repetir}>Repetir el reto</button>
        </div>
      </div>
    );
  }

  const p = PREGUNTAS[indice];
  return (
    <div className="reto-tarjeta">
      <div className="reto-cabeza">
        <span className="reto-materia"><i className={`mdi ${p.icono}`}></i>{p.materia}</span>
        <span className="reto-contador">Pregunta {indice + 1} de {PREGUNTAS.length}</span>
      </div>
      <div className="reto-puntos">
        {PREGUNTAS.map((_, i) => (
          <span key={i} className={i < indice ? 'hecho' : i === indice ? 'actual' : ''}></span>
        ))}
      </div>
      <p className="reto-pregunta">{p.pregunta}</p>
      <div className="reto-opciones">
        {p.opciones.map((texto, i) => {
          let clase = 'reto-opcion';
          if (elegida !== null) {
            if (i === p.correcta) clase += ' correcta';
            else if (i === elegida) clase += ' incorrecta';
          }
          return (
            <button key={i} type="button" className={clase} disabled={elegida !== null} onClick={() => elegir(i)}>
              <span className="letra">{String.fromCharCode(65 + i)}</span><span>{texto}</span>
            </button>
          );
        })}
      </div>
      <div className="reto-pie">
        <button type="button" className="boton boton-primario reto-siguiente" disabled={elegida === null} onClick={siguiente}>
          {indice === PREGUNTAS.length - 1 ? 'Ver resultado' : 'Siguiente'}
        </button>
      </div>
    </div>
  );
}

export default function Landing() {
  const listo = useEstilos(['materialdesignicons.min.css', 'landing.css']);
  const { sesion } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [activa, setActiva] = useState('');

  useEffect(() => {
    document.title = 'PREICFES — Practica para el examen Saber 11';
  }, []);

  // Resalta el enlace de la sección visible
  useEffect(() => {
    if (!listo || !('IntersectionObserver' in window)) return undefined;
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (e.isIntersecting) setActiva(e.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    SECCIONES.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observador.observe(el);
    });
    return () => observador.disconnect();
  }, [listo]);

  if (!listo) return null;

  return (
    <>
      <header className="barra">
        <div className="envoltorio">
          <div className="barra-izq">
            <BotonEntrar clase="btn-entrar" sesion={sesion} />
            <button
              className="hamburguesa"
              type="button"
              aria-label="Abrir menú"
              aria-expanded={menuAbierto}
              onClick={() => setMenuAbierto((v) => !v)}
            >
              <span></span><span></span><span></span>
            </button>
          </div>
          <a className="marca" href="#inicio">
            <img src={asset('images/logo/preicfes.svg')} alt="PREICFES" />
          </a>
          <nav className={`enlaces${menuAbierto ? ' abierto' : ''}`} aria-label="Secciones de la página">
            {SECCIONES.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={activa === s.id ? 'activo' : ''}
                onClick={() => setMenuAbierto(false)}
              >
                {s.texto}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <section id="inicio" className="heroe">
          <div className="envoltorio">
            <div>
              <span className="chip"><i className="mdi mdi-check-decagram"></i> Preparación para el Saber 11</span>
              <h1>Prepárate para el ICFES <span className="resalto">practicando de verdad</span></h1>
              <p className="intro">PREICFES es una plataforma de simulacros por áreas para que practiques a tu ritmo, revises tus resultados y llegues al examen con más seguridad.</p>
              <div className="cta">
                <a className="boton boton-primario" href="#reto">Hacer el mini reto</a>
                <BotonEntrar clase="boton boton-secundario" sesion={sesion} />
              </div>
              <div className="areas-mini" style={{ marginTop: 28 }}>
                <span><i className="mdi mdi-book-open-variant"></i> Lectura Crítica</span>
                <span><i className="mdi mdi-calculator-variant"></i> Matemáticas</span>
                <span><i className="mdi mdi-earth"></i> Sociales</span>
                <span><i className="mdi mdi-flask"></i> Ciencias Naturales</span>
                <span><i className="mdi mdi-translate"></i> Inglés</span>
              </div>
            </div>
            <div className="heroe-arte">
              <img src={asset('images/home/hero-hojas.svg')} alt="Hoja de respuestas con burbujas y un lápiz" />
            </div>
          </div>
        </section>

        <section id="nosotros" className="seccion">
          <div className="envoltorio">
            <div className="titulo-seccion">
              <span className="chip"><i className="mdi mdi-lightbulb"></i> Nosotros</span>
              <h2>¿Qué es PREICFES y cómo surgió?</h2>
            </div>
                        <div className="nosotros">
              <div>
                <h3>La idea</h3>
                <p>PREICFES nació como proyecto de grado, de la necesidad de tener un lugar sencillo y gratuito para practicar el examen Saber 11 por áreas, sin depender de hojas impresas ni de plataformas complicadas. La idea es que cualquier estudiante pueda entrar, resolver un simulacro y ver en qué áreas debe reforzar más.</p>
              </div>
              <div>
                <h3>Cómo funciona por dentro</h3>
                <p>La plataforma organiza las preguntas por las cinco áreas del examen, guarda los resultados de cada simulacro y le muestra al estudiante su progreso a lo largo del tiempo, para que la práctica tenga un propósito claro.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="reto" className="seccion raya">
          <div className="envoltorio">
            <div className="titulo-seccion">
              <span className="chip"><i className="mdi mdi-timer"></i> Ponte a prueba</span>
              <h2>Un mini reto: 5 preguntas, una por cada área</h2>
              <p>No necesitas iniciar sesión para intentarlo. Es solo una probadita de lo que encontrarás en los simulacros completos.</p>
            </div>
            <div id="reto-caja"><MiniReto sesion={sesion} /></div>
          </div>
        </section>

        <section id="como-funciona" className="seccion">
          <div className="envoltorio">
            <div className="titulo-seccion">
              <span className="chip"><i className="mdi mdi-chart-line"></i> Cómo funciona</span>
              <h2>Practicar es así de simple</h2>
            </div>
            <div className="pasos">
              <div className="paso">
                <div className="numero">1</div>
                <h3>Inicia sesión</h3>
                <p>Entra con tu cuenta de estudiante para guardar tu progreso en cada simulacro.</p>
              </div>
              <div className="paso">
                <div className="numero">2</div>
                <h3>Elige un área</h3>
                <p>Escoge el área que quieres practicar o resuelve un simulacro completo.</p>
              </div>
              <div className="paso">
                <div className="numero">3</div>
                <h3>Revisa tus resultados</h3>
                <p>Mira tu puntaje y tus aciertos para saber qué reforzar antes del examen.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="pie">
        <div className="envoltorio pie">
          <a className="marca" href="#inicio"><img src={asset('images/logo/preicfes.svg')} alt="PREICFES" /></a>
          <small>PREICFES, preparación para el examen Saber 11.</small>
        </div>
      </footer>
    </>
  );
}
