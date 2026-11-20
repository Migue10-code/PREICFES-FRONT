import { useEffect, useState } from 'react';
import { actualizarPregunta, actualizarRespuesta, getRespuestasPorPregunta } from '../api/api';
import { limpiarComillas } from '../util/texto';
import Modal from './Modal';

// Ventana para editar una pregunta y sus respuestas (se usa en varias pantallas del administrador).
// <EditarPreguntaModal pregunta={objeto | null} onCerrar={..} onGuardado={..} />
export default function EditarPreguntaModal({ pregunta, onCerrar, onGuardado }) {
  const [enunciado, setEnunciado] = useState('');
  const [respuestas, setRespuestas] = useState([]);
  const [correctaId, setCorrectaId] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!pregunta) return undefined;
    let vivo = true;
    setEnunciado(limpiarComillas(pregunta.TextoPregunta));
    setRespuestas([]);
    setCorrectaId(null);
    setMensaje('');

    getRespuestasPorPregunta(pregunta.CodPregunta)
      .then((lista) => {
        if (!vivo) return;
        setRespuestas(
          lista.map((r) => ({
            CodRespuesta: r.CodRespuesta,
            texto: r.TextoRespuesta || ''
          }))
        );
        const correcta = lista.find((r) => limpiarComillas(r.Estado) === 'Correcta');
        setCorrectaId(correcta ? correcta.CodRespuesta : null);
      })
      .catch(() => {
        if (vivo) setMensaje('No se pudieron cargar las respuestas.');
      });

    return () => {
      vivo = false;
    };
  }, [pregunta]);

  const cambiarTexto = (id, texto) => {
    setRespuestas((lista) => lista.map((r) => (r.CodRespuesta === id ? { ...r, texto } : r)));
  };

  const guardar = async () => {
    const texto = enunciado.trim();
    if (!texto) {
      setMensaje('El enunciado no puede estar vacío.');
      return;
    }
    setGuardando(true);
    setMensaje('');
    try {
      await actualizarPregunta(pregunta.CodPregunta, { TextoPregunta: texto });
      for (const r of respuestas) {
        await actualizarRespuesta(r.CodRespuesta, {
          TextoRespuesta: r.texto.trim(),
          Estado: r.CodRespuesta === correctaId ? 'Correcta' : 'Incorrecta'
        });
      }
      onGuardado();
    } catch (e) {
      setMensaje('Error al guardar.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      abierto={!!pregunta}
      titulo="Editar Pregunta"
      onCerrar={onCerrar}
      grande
      pie={
        <>
          <button type="button" className="btn btn-secondary" onClick={onCerrar}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" onClick={guardar} disabled={guardando}>
            Guardar
          </button>
        </>
      }
    >
      <div className="mb-3">
        <label className="form-label" htmlFor="edit-enunciado">
          Enunciado
        </label>
        <textarea
          className="form-control"
          id="edit-enunciado"
          rows="3"
          value={enunciado}
          onChange={(e) => setEnunciado(e.target.value)}
        />
      </div>
      <div>
        {respuestas.map((r) => (
          <div key={r.CodRespuesta} className="mb-2 d-flex align-items-center gap-2">
            <input
              type="radio"
              name="correcta-edicion"
              aria-label="Respuesta correcta"
              checked={r.CodRespuesta === correctaId}
              onChange={() => setCorrectaId(r.CodRespuesta)}
            />
            <input
              type="text"
              className="form-control"
              value={r.texto}
              onChange={(e) => cambiarTexto(r.CodRespuesta, e.target.value)}
            />
          </div>
        ))}
      </div>
      {mensaje && <p style={{ marginTop: 10, color: 'red' }}>{mensaje}</p>}
    </Modal>
  );
}
