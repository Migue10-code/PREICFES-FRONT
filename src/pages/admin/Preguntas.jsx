import { useCallback, useEffect, useState } from 'react';
import {
  crearPregunta,
  crearRespuesta,
  eliminarPreguntaCompleta,
  getAreas,
  getPreguntas,
  getTemas
} from '../../api/api';
import EditarPreguntaModal from '../../components/EditarPreguntaModal';
import { useTitulo } from '../../hooks/useTitulo';
import { limpiarComillas } from '../../util/texto';

const PLACEHOLDERS = ['Opción A', 'Opción B', 'Opción C', 'Opción D'];

export default function Preguntas() {
  useTitulo('Crear Nueva Pregunta');

  const [areas, setAreas] = useState([]);
  const [temas, setTemas] = useState([]);
  const [preguntas, setPreguntas] = useState(null); // null = cargando
  const [codArea, setCodArea] = useState('');
  const [codTema, setCodTema] = useState('');
  const [enunciado, setEnunciado] = useState('');
  const [opciones, setOpciones] = useState(['', '', '', '']);
  const [correcta, setCorrecta] = useState(null); // índice 0-3
  const [mensaje, setMensaje] = useState(null); // { texto, color }
  const [editando, setEditando] = useState(null);

  const cargarPreguntas = useCallback(() => {
    getPreguntas()
      .then(setPreguntas)
      .catch(() => setPreguntas([]));
  }, []);

  useEffect(() => {
    getAreas().then(setAreas).catch(() => setAreas([]));
    getTemas().then(setTemas).catch(() => setTemas([]));
    cargarPreguntas();
  }, [cargarPreguntas]);

  const temasDelArea = temas.filter((t) => String(t.CodArea) === String(codArea));

  const cambiarArea = (e) => {
    setCodArea(e.target.value);
    setCodTema('');
  };

  const cambiarOpcion = (i, texto) => {
    setOpciones((lista) => lista.map((o, idx) => (idx === i ? texto : o)));
  };

  const guardar = async () => {
    const texto = enunciado.trim();
    const textos = opciones.map((o) => o.trim());

    if (!texto || !codTema) {
      setMensaje({ texto: 'Selecciona tema y escribe la pregunta.', color: 'red' });
      return;
    }
    if (correcta === null) {
      setMensaje({ texto: 'Marca cuál es la respuesta correcta.', color: 'red' });
      return;
    }
    if (textos.some((t) => !t)) {
      setMensaje({ texto: 'Completa las 4 opciones.', color: 'red' });
      return;
    }

    try {
      const res = await crearPregunta({ TextoPregunta: texto, CodTema: codTema });
      const codPregunta = res.id;
      for (let i = 0; i < textos.length; i++) {
        await crearRespuesta({
          TextoRespuesta: textos[i],
          Estado: i === correcta ? 'Correcta' : 'Incorrecta',
          CodPregunta: codPregunta
        });
      }
      setMensaje({ texto: 'Pregunta guardada con sus respuestas.', color: 'green' });
      setEnunciado('');
      setOpciones(['', '', '', '']);
      setCorrecta(null);
      cargarPreguntas();
    } catch (e) {
      setMensaje({ texto: 'Error al guardar.', color: 'red' });
    }
  };

  const eliminar = async (codPregunta) => {
    if (!window.confirm('¿Eliminar esta pregunta y sus respuestas?')) return;
    try {
      await eliminarPreguntaCompleta(codPregunta);
    } catch (e) {
      window.alert('Error al eliminar.');
    }
    cargarPreguntas();
  };

  return (
    <>
      <section className="tab-components">
        <div className="container-fluid">
          <div className="title-wrapper pt-30">
            <h2>Crear Nueva Pregunta</h2>
          </div>

          <div className="card-style mb-30">
            <h6 className="mb-25">Nueva Pregunta</h6>
            <div className="select-style-1">
              <label htmlFor="selectArea">Área</label>
              <div className="select-position">
                <select id="selectArea" value={codArea} onChange={cambiarArea}>
                  <option value="">Selecciona el Área</option>
                  {areas.map((a) => (
                    <option key={a.CodArea} value={a.CodArea}>
                      {a.NombreArea}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="select-style-1">
              <label htmlFor="selectTema">Tema</label>
              <div className="select-position">
                <select id="selectTema" value={codTema} onChange={(e) => setCodTema(e.target.value)}>
                  <option value="">Selecciona el Tema</option>
                  {temasDelArea.map((t) => (
                    <option key={t.CodTema} value={t.CodTema}>
                      {t.NombreTema}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="input-style-1">
              <label htmlFor="enunciado">Enunciado</label>
              <textarea
                id="enunciado"
                placeholder="Escribe la pregunta aquí..."
                rows="4"
                style={{ width: '100%', padding: 10, border: '1px solid #e0e0e0', borderRadius: 6 }}
                value={enunciado}
                onChange={(e) => setEnunciado(e.target.value)}
              />
            </div>
            <h6 className="mt-20 mb-15">Respuestas (marca la correcta)</h6>
            <div>
              {opciones.map((valor, i) => (
                <div key={i} className="respuesta-row d-flex align-items-center gap-10 mb-10">
                  <input
                    type="radio"
                    name="correcta"
                    value={i}
                    aria-label={`Marcar ${PLACEHOLDERS[i]} como correcta`}
                    checked={correcta === i}
                    onChange={() => setCorrecta(i)}
                  />
                  <input
                    type="text"
                    className="form-control"
                    placeholder={PLACEHOLDERS[i]}
                    value={valor}
                    onChange={(e) => cambiarOpcion(i, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <button type="button" className="main-btn success-btn-outline btn-hover mt-10" onClick={guardar}>
              Guardar Pregunta
            </button>
            <p style={{ marginTop: 10, color: mensaje?.color }}>{mensaje?.texto}</p>
          </div>

          <div className="card-style mb-30">
            <h6 className="mb-25">Preguntas registradas</h6>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Pregunta</th>
                    <th>Tema</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {preguntas === null && (
                    <tr>
                      <td colSpan="4">Cargando...</td>
                    </tr>
                  )}
                  {preguntas !== null && preguntas.length === 0 && (
                    <tr>
                      <td colSpan="4">Sin registros</td>
                    </tr>
                  )}
                  {preguntas !== null &&
                    preguntas.map((p, i) => {
                      const tema = temas.find((t) => String(t.CodTema) === String(p.CodTema));
                      return (
                        <tr key={p.CodPregunta}>
                          <td>{i + 1}</td>
                          <td>{limpiarComillas(p.TextoPregunta) || '—'}</td>
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
          cargarPreguntas();
        }}
      />
    </>
  );
}
