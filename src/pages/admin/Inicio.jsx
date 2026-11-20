import {
  ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip
} from 'chart.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  eliminarPreguntaCompleta, getEstudiantes, getIntentos, getPreguntasPorArea, getTemas, getUsuarios
} from '../../api/api';
import Carousel from '../../components/Carousel';
import EditarPreguntaModal from '../../components/EditarPreguntaModal';
import { useTitulo } from '../../hooks/useTitulo';
import { AREAS, SLIDES } from '../../util/contenido';
import { limpiarComillas } from '../../util/texto';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const promedio = (arr) =>
  arr.length ? Number((arr.reduce((s, d) => s + d.puntaje, 0) / arr.length).toFixed(1)) : 0;

function Torta({ titulo, valor, color }) {
  const data = {
    labels: ['Promedio', 'Restante'],
    datasets: [{ data: [valor, Math.max(0, 100 - valor)], backgroundColor: [color, '#e5e7eb'] }]
  };
  return (
    <div className="col-md-4">
      <div className="card-style p-3 h-100">
        <h6 className="mb-3">{titulo}</h6>
        <Doughnut data={data} options={{ plugins: { legend: { display: false } }, cutout: '65%' }} />
        <p className="text-center fw-bold mt-1" style={{ fontSize: '1.3rem', color }}>{valor} pts</p>
      </div>
    </div>
  );
}

function BarrasH({ titulo, etiquetas, valores, color, etiqueta }) {
  const data = { labels: etiquetas, datasets: [{ label: etiqueta, data: valores, backgroundColor: color }] };
  const opciones = {
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: { x: { beginAtZero: true, max: 100 } }
  };
  return (
    <div className="col-md-4">
      <div className="card-style p-3 h-100">
        <h6 className="mb-3">{titulo}</h6>
        <Bar data={data} options={opciones} />
      </div>
    </div>
  );
}

function Dashboard() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let vivo = true;
    Promise.all([getEstudiantes(), getUsuarios(), getIntentos()])
      .then(([estudiantes, usuarios, intentos]) => {
        if (!vivo) return;
        // Cruza: intento -> usuario -> estudiante
        const lista = intentos
          .map((it) => {
            const u = usuarios.find((x) => x.CodUsuario === it.CodUsuario);
            const e = u ? estudiantes.find((x) => x.CodEstudiante === u.CodEstudiante) : null;
            return {
              puntaje: Number(it.Puntaje) || 0,
              grado: e ? String(e.Grado) : null,
              seccion: e ? String(e.Seccion) : null,
              nombre: e ? `${e.Nombre} ${e.Apellido}` : 'Desconocido'
            };
          })
          .filter((d) => d.grado);
        setDatos(lista);
      })
      .catch(() => vivo && setError(true));
    return () => { vivo = false; };
  }, []);

  const r = useMemo(() => {
    if (!datos) return null;
    const g10 = datos.filter((d) => d.grado === '10');
    const g11 = datos.filter((d) => d.grado === '11');
    const porGrado = {};
    datos.forEach((d) => { porGrado[d.grado] = (porGrado[d.grado] || 0) + 1; });
    const grados = Object.keys(porGrado);
    const porGrupo = {};
    datos.forEach((d) => {
      const k = `Grado ${d.grado} - Grupo ${d.seccion}`;
      (porGrupo[k] = porGrupo[k] || []).push(d.puntaje);
    });
    const grupos = Object.keys(porGrupo).sort();
    const top = (arr) => arr.slice().sort((a, b) => b.puntaje - a.puntaje).slice(0, 5);
    return {
      prom10: promedio(g10),
      prom11: promedio(g11),
      grados,
      intentos: grados.map((g) => porGrado[g]),
      grupos,
      promGrupos: grupos.map((k) => Number((porGrupo[k].reduce((s, v) => s + v, 0) / porGrupo[k].length).toFixed(1))),
      top10: top(g10),
      top11: top(g11)
    };
  }, [datos]);

  return (
    <section id="dashboard" className="inicio-seccion" style={{ marginTop: 0 }}>
      <h3>Dashboard</h3>
      <p className="inicio-sub">Estadísticas generales de rendimiento por grado y grupo.</p>
      {error && <p className="text-danger">No se pudieron cargar las estadísticas.</p>}
      {!r && !error && <p>Cargando estadísticas…</p>}
      {r && (
        <>
          <div className="row g-4 mb-4">
            <Torta titulo="Promedio puntaje — Grado 10" valor={r.prom10} color="#4f46e5" />
            <Torta titulo="Promedio puntaje — Grado 11" valor={r.prom11} color="#0ea5e9" />
            <div className="col-md-4">
              <div className="card-style p-3 h-100">
                <h6 className="mb-3">Intentos por grado</h6>
                <Doughnut
                  data={{
                    labels: r.grados.map((g) => `Grado ${g}`),
                    datasets: [{ data: r.intentos, backgroundColor: ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'] }]
                  }}
                  options={{ plugins: { legend: { position: 'bottom' } } }}
                />
              </div>
            </div>
          </div>
          <div className="row g-4 mb-4">
            <BarrasH titulo="Promedio puntaje por grupo" etiquetas={r.grupos} valores={r.promGrupos} color="#4f46e5" etiqueta="Promedio" />
            <BarrasH titulo="Top 5 mejores puntajes — Grado 10" etiquetas={r.top10.map((d) => d.nombre)} valores={r.top10.map((d) => d.puntaje)} color="#10b981" etiqueta="Puntaje" />
            <BarrasH titulo="Top 5 mejores puntajes — Grado 11" etiquetas={r.top11.map((d) => d.nombre)} valores={r.top11.map((d) => d.puntaje)} color="#f59e0b" etiqueta="Puntaje" />
          </div>
        </>
      )}
    </section>
  );
}

// Tabla de preguntas del área elegida (ver, editar, eliminar)
function PanelPreguntas({ area, temas, onCerrar }) {
  const [preguntas, setPreguntas] = useState(null);
  const [error, setError] = useState(false);
  const [editando, setEditando] = useState(null);
  const panel = useRef(null);

  const cargar = () => {
    setPreguntas(null);
    setError(false);
    getPreguntasPorArea(area.codArea).then(setPreguntas).catch(() => setError(true));
  };

  useEffect(() => {
    cargar();
    panel.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area.codArea]);

  const eliminar = async (p) => {
    if (!window.confirm('¿Eliminar esta pregunta y sus respuestas?')) return;
    try {
      await eliminarPreguntaCompleta(p.CodPregunta);
    } catch (e) {
      window.alert('No se pudo eliminar la pregunta.');
    }
    cargar();
  };

  const nombreTema = (p) => {
    const t = temas.find((x) => String(x.CodTema) === String(p.CodTema));
    return t ? t.NombreTema : p.NombreTema || '—';
  };

  let cuerpo;
  if (error) cuerpo = <tr><td colSpan="4" className="text-center text-danger">Error al cargar.</td></tr>;
  else if (!preguntas) cuerpo = <tr><td colSpan="4" className="text-center">Cargando...</td></tr>;
  else if (!preguntas.length) cuerpo = <tr><td colSpan="4" className="text-center text-muted">Sin preguntas registradas.</td></tr>;
  else {
    cuerpo = preguntas.map((p, i) => (
      <tr key={p.CodPregunta}>
        <td>{i + 1}</td>
        <td>{limpiarComillas(p.TextoPregunta) || '—'}</td>
        <td>{nombreTema(p)}</td>
        <td>
          <button className="btn btn-sm btn-warning me-1" onClick={() => setEditando(p)}>✏️ Editar</button>
          <button className="btn btn-sm btn-danger" onClick={() => eliminar(p)}>🗑️ Eliminar</button>
        </td>
      </tr>
    ));
  }

  return (
    <section id="panel-crud" ref={panel} style={{ marginTop: 32 }}>
      <div className="card-style">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Preguntas — {area.nombre}</h5>
          <button className="btn btn-sm btn-outline-secondary" onClick={onCerrar}>✕ Cerrar</button>
        </div>
        <div className="table-responsive">
          <table className="table table-bordered table-hover" style={{ fontSize: '.85rem' }}>
            <thead className="table-light">
              <tr><th>#</th><th>Enunciado</th><th>Tema</th><th>Acciones</th></tr>
            </thead>
            <tbody>{cuerpo}</tbody>
          </table>
        </div>
      </div>
      <EditarPreguntaModal
        pregunta={editando}
        onCerrar={() => setEditando(null)}
        onGuardado={() => { setEditando(null); cargar(); }}
      />
    </section>
  );
}

export default function Inicio() {
  useTitulo('Menú principal');
  const [area, setArea] = useState(null);
  const [temas, setTemas] = useState([]);

  useEffect(() => {
    getTemas().then(setTemas).catch(() => setTemas([]));
  }, []);

  return (
    <section className="section">
      <div className="container-fluid pt-30">
        <div id="inicio" className="inicio">
          <Dashboard />
          <Carousel slides={SLIDES} />

          <section id="areas" className="inicio-seccion">
            <h3>Áreas del examen</h3>
            <p className="inicio-sub">Practica las cinco áreas que evalúa el examen Saber 11.</p>
            <div className="row g-4 justify-content-center">
              {AREAS.map((a) => (
                <div key={a.codArea} className="col-12 col-md-6 col-xl-4 col-xxl">
                  <div
                    className="tarjeta"
                    style={{ cursor: 'pointer' }}
                    role="button"
                    tabIndex={0}
                    onClick={() => setArea(a)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setArea(a); }
                    }}
                  >
                    <div className={`icono ${a.color}`}><i className={`mdi ${a.icono}`}></i></div>
                    <h5>{a.nombre}</h5>
                    <p>{a.texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {area && <PanelPreguntas area={area} temas={temas} onCerrar={() => setArea(null)} />}
        </div>
      </div>
    </section>
  );
}
