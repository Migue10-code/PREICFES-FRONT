import { useCallback, useEffect, useState } from 'react';
import {
  eliminarPreguntaCompleta,
  getAreas,
  getPreguntas,
  getPreguntasPorArea,
  getPreguntasPorTema,
  getTemas
} from '../../api/api';
import EditarPreguntaModal from '../../components/EditarPreguntaModal';
import { useTitulo } from '../../hooks/useTitulo';
import { limpiarComillas } from '../../util/texto';

const nombreDe = (x) => (x ? x.NombreArea || x.NombreTema || x.Nombre : '');

export default function Simulacros() {
  useTitulo('Crear Simulacro');

  const [areas, setAreas] = useState([]);
  const [temas, setTemas] = useState([]);
  const [preguntas, setPreguntas] = useState(null); // null = cargando
  const [titulo, setTitulo] = useState('Todas las preguntas');
  const [errorCarga, setErrorCarga] = useState(false);

  const [tipo, setTipo] = useState('general');
  const [codArea, setCodArea] = useState('');
  const [codTema, setCodTema] = useState('');
  const [editando, setEditando] = useState(null);

  const temasDelArea = temas.filter((t) => String(t.CodArea) === String(codArea));

  // Carga las preguntas según el filtro indicado (igual que "Ver preguntas" en el original)
  const aplicarFiltro = useCallback(
    async (t, area, tema, listaAreas, listaTemas) => {
      try {
        let resultado;
        let nuevoTitulo = 'Todas las preguntas';

        if (t === 'area') {
          if (!area) {
            window.alert('Selecciona un área para filtrar las preguntas.');
            return;
          }
          resultado = await getPreguntasPorArea(area);
          const a = listaAreas.find((x) => String(x.CodArea) === String(area));
          nuevoTitulo = 'Preguntas — ' + (a ? nombreDe(a) : '—');
        } else if (t === 'tema') {
          if (!tema) {
            window.alert('Selecciona un tema para filtrar las preguntas.');
            return;
          }
          resultado = await getPreguntasPorTema(tema);
          const tm = listaTemas.find((x) => String(x.CodTema) === String(tema));
          nuevoTitulo = 'Preguntas — ' + (tm ? nombreDe(tm) : '');
        } else {
          resultado = await getPreguntas();
        }

        setErrorCarga(false);
        setTitulo(nuevoTitulo);
        setPreguntas(resultado);
      } catch (error) {
        console.error(error);
        setErrorCarga(true);
        setPreguntas([]);
      }
    },
    []
  );

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const [a, t] = await Promise.all([getAreas(), getTemas()]);
        if (!vivo) return;
        setAreas(a);
        setTemas(t);
        const todas = await getPreguntas();
        if (vivo) setPreguntas(todas);
      } catch (e) {
        if (vivo) {
          setErrorCarga(true);
          setPreguntas([]);
        }
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  const cambiarArea = (e) => {
    setCodArea(e.target.value);
    setCodTema('');
  };

  const recargar = () => aplicarFiltro(tipo, codArea, codTema, areas, temas);

  const eliminar = async (codPregunta) => {
    if (!window.confirm('¿Eliminar esta pregunta y sus respuestas?')) return;
    try {
      await eliminarPreguntaCompleta(codPregunta);
    } catch (e) {
      window.alert('Error al eliminar.');
    }
    recargar();
  };

  return (
    <>
      <section className="tab-components">
        <div className="container-fluid">
          <div className="title-wrapper pt-30">
            <div className="row align-items-center">
              <div className="col-md-6">
                <div className="title">
                  <h2>Crear Simulacro</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="card-style mb-30">
            <h6 className="mb-25">Tipo de simulacro</h6>
            <div className="select-style-1">
              <label htmlFor="tipo-simulacro">Selecciona un tipo de Simulacro</label>
              <div className="select-position">
                <select id="tipo-simulacro" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                  <option value="general">General (Todas las Áreas)</option>
                  <option value="area">Área Única</option>
                  <option value="tema">Tema Único</option>
                </select>
              </div>
            </div>
            <div className="select-style-1">
              <label htmlFor="sel-area">Selecciona el Área</label>
              <div className="select-position">
                <select id="sel-area" value={codArea} onChange={cambiarArea}>
                  <option value="">Selecciona el Área</option>
                  {areas.map((a) => (
                    <option key={a.CodArea} value={a.CodArea}>
                      {nombreDe(a)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="select-style-1">
              <label htmlFor="sel-tema">Selecciona el Tema</label>
              <div className="select-position">
                <select id="sel-tema" value={codTema} onChange={(e) => setCodTema(e.target.value)}>
                  <option value="">Selecciona el Tema</option>
                  {temasDelArea.map((t) => (
                    <option key={t.CodTema} value={t.CodTema}>
                      {nombreDe(t)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-3">
              <button type="button" className="main-btn success-btn-outline rounded-full btn-hover" onClick={recargar}>
                Ver preguntas
              </button>
            </div>
          </div>

          {/* Tabla CRUD de preguntas */}
          <div className="card-style mb-30">
            <h6 className="mb-3">{titulo}</h6>
            <div className="table-responsive">
              <table className="table table-bordered table-hover" style={{ fontSize: '.85rem' }}>
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Enunciado</th>
                    <th>Área</th>
                    <th>Tema</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {preguntas === null && (
                    <tr>
                      <td colSpan="5" className="text-center">
                        Cargando...
                      </td>
                    </tr>
                  )}
                  {errorCarga && (
                    <tr>
                      <td colSpan="5" className="text-center text-danger">
                        No se pudieron cargar las preguntas. Verifica que el servidor esté activo e intenta de nuevo.
                      </td>
                    </tr>
                  )}
                  {!errorCarga && preguntas !== null && preguntas.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">
                        Sin preguntas.
                      </td>
                    </tr>
                  )}
                  {!errorCarga &&
                    preguntas !== null &&
                    preguntas.map((p, i) => {
                      const tema = temas.find((t) => String(t.CodTema) === String(p.CodTema));
                      const area = tema ? areas.find((a) => String(a.CodArea) === String(tema.CodArea)) : null;
                      return (
                        <tr key={p.CodPregunta}>
                          <td>{i + 1}</td>
                          <td>{limpiarComillas(p.TextoPregunta) || '—'}</td>
                          <td>{area ? area.NombreArea : '—'}</td>
                          <td>{tema ? tema.NombreTema : '—'}</td>
                          <td>
                            <button type="button" className="btn btn-sm btn-warning me-1" onClick={() => setEditando(p)}>
                              ✏️ Editar
                            </button>
                            <button type="button" className="btn btn-sm btn-danger" onClick={() => eliminar(p.CodPregunta)}>
                              🗑️ Eliminar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <EditarPreguntaModal
        pregunta={editando}
        onCerrar={() => setEditando(null)}
        onGuardado={() => {
          setEditando(null);
          recargar();
        }}
      />
    </>
  );
}
