import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  crearIntento,
  getAreas,
  getPreguntasAleatorio,
  getPreguntasPorArea
} from '../../api/api';
import { useAuth } from '../../auth/AuthContext';
import { useTitulo } from '../../hooks/useTitulo';
import { limpiarComillas } from '../../util/texto';

// Estilos propios de esta pantalla (estaban dentro de simulacro.html)
const ESTILOS = `
  .pregunta-card { background:#fff; border-radius:10px; padding:24px; margin-bottom:20px; box-shadow:0 2px 8px rgba(0,0,0,.08); }
  .pregunta-num { font-size:12px; color:#888; margin-bottom:8px; }
  .pregunta-texto { font-weight:600; margin-bottom:16px; }
  .opcion { display:flex; align-items:center; gap:10px; padding:10px 14px; border:1.5px solid #e0e0e0; border-radius:8px; margin-bottom:8px; cursor:pointer; transition:.2s; }
  .opcion:hover { border-color:#4f46e5; background:#f5f4ff; }
  .opcion.seleccionada { border-color:#4f46e5; background:#ede9fe; }
  .opcion.correcta { border-color:#16a34a; background:#dcfce7; }
  .opcion.incorrecta { border-color:#dc2626; background:#fee2e2; }
  #resultado-final { text-align:center; padding:40px; }
  #resultado-final h2 { font-size:2rem; font-weight:700; }
  .barra-progreso { height:6px; background:#e5e7eb; border-radius:3px; margin-bottom:24px; }
  .barra-progreso-fill { height:100%; background:#4f46e5; border-radius:3px; transition:.3s; }
`;

export default function Simulacro() {
  useTitulo('Simulacro');
  const { sesion } = useAuth();
  const [params] = useSearchParams();
  const codArea = params.get('area');
  const modo = params.get('modo');

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [preguntas, setPreguntas] = useState([]);
  const [seleccion, setSeleccion] = useState({}); // { CodPregunta: { codResp, estado } }
  const [resultado, setResultado] = useState(null); // { correctas, puntaje } cuando ya se entregó
  const refResultado = useRef(null);

  useEffect(() => {
    let vivo = true;

    async function cargar() {
      setCargando(true);
      setError(false);
      setPreguntas([]);
      setSeleccion({});
      setResultado(null);
      setTitulo('');
      setSubtitulo('');

      try {
        let lista = [];
        if (modo === 'aleatorio') {
          lista = await getPreguntasAleatorio();
          if (!vivo) return;
          setTitulo('Simulacro General');
          setSubtitulo('Combinación aleatoria de todas las áreas');
        } else if (codArea) {
          lista = await getPreguntasPorArea(codArea);
          const areas = await getAreas();
          if (!vivo) return;
          // eslint-disable-next-line eqeqeq
          const area = areas.find((a) => a.CodArea == codArea);
          setTitulo(area ? area.NombreArea : 'Simulacro');
          setSubtitulo(`${lista.length} preguntas`);
        }
        if (!vivo) return;
        setPreguntas(lista);
        setCargando(false);
      } catch (e) {
        if (!vivo) return;
        setError(true);
        setCargando(false);
      }
    }

    cargar();
    return () => {
      vivo = false;
    };
  }, [modo, codArea]);

  // Al entregar, bajar hasta el resultado
  useEffect(() => {
    if (resultado && refResultado.current) {
      refResultado.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [resultado]);

  const elegir = (codPregunta, respuesta) => {
    if (resultado) return;
    setSeleccion((previa) => ({
      ...previa,
      [codPregunta]: { codResp: respuesta.CodRespuesta, estado: limpiarComillas(respuesta.Estado) }
    }));
  };

  const entregar = async () => {
    if (resultado) return;

    let correctas = 0;
    preguntas.forEach((p) => {
      const sel = seleccion[p.CodPregunta];
      if (sel && sel.estado === 'Correcta') correctas += 1;
    });
    const puntaje = preguntas.length > 0 ? Math.round((correctas / preguntas.length) * 500) : 0;

    setResultado({ correctas, puntaje });

    try {
      if (sesion && sesion.CodUsuario) {
        await crearIntento({
          CodUsuario: sesion.CodUsuario,
          Fecha: new Date().toISOString().slice(0, 10),
          Puntaje: puntaje,
          Descripcion: modo === 'aleatorio' ? 'Simulacro General' : `Área ${codArea}`
        });
      }
    } catch (e) {
      // igual que antes: si no se puede guardar el intento, igual se muestra el resultado
    }
  };

  const respondidas = Object.keys(seleccion).length;
  const porcentaje = preguntas.length > 0 ? (respondidas / preguntas.length) * 100 : 0;

  return (
    <section className="section">
      <style>{ESTILOS}</style>
      <div className="container-fluid pt-30">
        {cargando && (
          <div id="cargando" style={{ textAlign: 'center', padding: 60 }}>
            <p>Cargando preguntas...</p>
          </div>
        )}

        {error && (
          <div id="cargando" style={{ textAlign: 'center', padding: 60 }}>
            <p style={{ color: 'red' }}>Error al cargar las preguntas. Verifica que el servidor esté corriendo.</p>
          </div>
        )}

        {!cargando && !error && (
          <div id="simulacro-contenido" style={{ maxWidth: 800, margin: '0 auto' }}>
            <h4 id="titulo-simulacro" style={{ marginBottom: 6 }}>
              {titulo}
            </h4>
            <p id="subtitulo-simulacro" style={{ color: '#888', marginBottom: 16 }}>
              {subtitulo}
            </p>
            <div className="barra-progreso">
              <div className="barra-progreso-fill" id="barra-fill" style={{ width: `${porcentaje}%` }}></div>
            </div>

            <div id="preguntas-container">
              {preguntas.length === 0 && (
                <p style={{ textAlign: 'center', color: '#888' }}>
                  No hay preguntas disponibles para esta área todavía.
                </p>
              )}

              {preguntas.map((p, idx) => (
                <div className="pregunta-card" key={p.CodPregunta}>
                  <div className="pregunta-num">
                    Pregunta {idx + 1} de {preguntas.length}
                  </div>
                  <div className="pregunta-texto">{limpiarComillas(p.TextoPregunta)}</div>
                  {(p.respuestas || []).map((r) => {
                    const esCorrecta = limpiarComillas(r.Estado) === 'Correcta';
                    const elegida =
                      seleccion[p.CodPregunta] && seleccion[p.CodPregunta].codResp === r.CodRespuesta;
                    let clase = 'opcion';
                    if (elegida) clase += ' seleccionada';
                    if (resultado) {
                      if (esCorrecta) clase += ' correcta';
                      else if (elegida) clase += ' incorrecta';
                    }
                    return (
                      <div
                        key={r.CodRespuesta}
                        className={clase}
                        style={resultado ? { pointerEvents: 'none' } : undefined}
                        role="button"
                        tabIndex={resultado ? -1 : 0}
                        aria-pressed={Boolean(elegida)}
                        onClick={() => elegir(p.CodPregunta, r)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            elegir(p.CodPregunta, r);
                          }
                        }}
                      >
                        <span>{limpiarComillas(r.TextoRespuesta)}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {preguntas.length > 0 && !resultado && (
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <button id="btnEntregar" type="button" className="main-btn success-btn btn-hover" onClick={entregar}>
                  Entregar Simulacro
                </button>
              </div>
            )}
          </div>
        )}

        {resultado && (
          <div id="resultado-final" ref={refResultado}>
            <h2 id="puntaje-texto">
              {resultado.correctas} / {preguntas.length} correctas
            </h2>
            <p id="detalle-resultado" style={{ color: '#666', margin: '10px 0 24px' }}>
              Puntaje estimado: {resultado.puntaje} puntos
            </p>
            <Link to="/estudiante" className="main-btn primary-btn btn-hover">
              Volver al inicio
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
