import { useCallback, useEffect, useMemo, useState } from 'react';
import { actualizarTema, crearTema, eliminarTema, getAreas, getTemas } from '../../api/api';
import Modal from '../../components/Modal';
import { useTitulo } from '../../hooks/useTitulo';

export default function Temas() {
  useTitulo('Agregar Nuevo Tema');

  const [areas, setAreas] = useState([]);
  const [temas, setTemas] = useState(null); // null = cargando
  const [form, setForm] = useState({ codArea: '', nombre: '', competencia: '' });
  const [mensaje, setMensaje] = useState(null); // { texto, color }
  const [edicion, setEdicion] = useState(null);

  const areasMap = useMemo(() => {
    const mapa = {};
    areas.forEach((a) => {
      mapa[a.CodArea] = a.NombreArea;
    });
    return mapa;
  }, [areas]);

  const cargarTabla = useCallback(() => {
    getTemas()
      .then(setTemas)
      .catch(() => setTemas([]));
  }, []);

  useEffect(() => {
    getAreas()
      .then(setAreas)
      .catch(() => setAreas([]));
    cargarTabla();
  }, [cargarTabla]);

  const cambiar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const guardar = async () => {
    const data = {
      NombreTema: form.nombre.trim(),
      Competencia: form.competencia.trim(),
      CodArea: form.codArea
    };
    if (!data.NombreTema || !data.CodArea) {
      setMensaje({ texto: 'Selecciona un área y escribe el tema.', color: 'red' });
      return;
    }
    try {
      await crearTema(data);
      setMensaje({ texto: 'Tema guardado.', color: 'green' });
      setForm((f) => ({ ...f, nombre: '', competencia: '' }));
      cargarTabla();
    } catch (e) {
      setMensaje({ texto: 'Error al guardar.', color: 'red' });
    }
  };

  const abrirEditar = (t) => {
    setEdicion({
      CodTema: t.CodTema,
      nombre: t.NombreTema,
      competencia: t.Competencia || '',
      codArea: String(t.CodArea)
    });
  };

  const cambiarEdicion = (campo) => (e) => setEdicion((d) => ({ ...d, [campo]: e.target.value }));

  const guardarEdicion = async () => {
    try {
      await actualizarTema(edicion.CodTema, {
        NombreTema: edicion.nombre.trim(),
        Competencia: edicion.competencia.trim(),
        CodArea: edicion.codArea
      });
      setEdicion(null);
      cargarTabla();
    } catch (e) {
      window.alert('Error al guardar.');
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este tema?')) return;
    try {
      await eliminarTema(id);
    } catch (e) {
      window.alert('Error al eliminar.');
    }
    cargarTabla();
  };

  return (
    <>
      <section className="tab-components">
        <div className="container-fluid">
          <div className="title-wrapper pt-30">
            <h2>Agregar Nuevo Tema</h2>
          </div>

          <div className="card-style mb-30">
            <h6 className="mb-25">Nuevo Tema</h6>
            <div className="select-style-1">
              <label htmlFor="selectArea">Área</label>
              <div className="select-position">
                <select id="selectArea" value={form.codArea} onChange={cambiar('codArea')}>
                  <option value="">Seleccionar</option>
                  {areas.map((a) => (
                    <option key={a.CodArea} value={a.CodArea}>
                      {a.NombreArea}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="input-style-1">
              <label htmlFor="nombreTema">Nombre del Tema</label>
              <input type="text" id="nombreTema" placeholder="Nombre Tema" value={form.nombre} onChange={cambiar('nombre')} />
            </div>
            <div className="input-style-1">
              <label htmlFor="competencia">Competencia</label>
              <input type="text" id="competencia" placeholder="Ej. Razonamiento" value={form.competencia} onChange={cambiar('competencia')} />
            </div>
            <button type="button" className="main-btn success-btn-outline btn-hover mt-10" onClick={guardar}>
              Añadir Tema
            </button>
            <p style={{ marginTop: 10, color: mensaje?.color }}>{mensaje?.texto}</p>
          </div>

          <div className="card-style mb-30">
            <h6 className="mb-25">Temas registrados</h6>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Competencia</th>
                    <th>Área</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {temas === null && (
                    <tr>
                      <td colSpan="5">Cargando...</td>
                    </tr>
                  )}
                  {temas !== null && temas.length === 0 && (
                    <tr>
                      <td colSpan="5">Sin registros</td>
                    </tr>
                  )}
                  {temas !== null &&
                    temas.map((t, i) => (
                      <tr key={t.CodTema}>
                        <td>{i + 1}</td>
                        <td>{t.NombreTema}</td>
                        <td>{t.Competencia}</td>
                        <td>{areasMap[t.CodArea] || t.CodArea}</td>
                        <td>
                          <button type="button" className="btn btn-sm btn-warning me-1" onClick={() => abrirEditar(t)}>
                            ✏️ Editar
                          </button>
                          <button type="button" className="btn btn-sm btn-danger" onClick={() => eliminar(t.CodTema)}>
                            🗑️ Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <Modal
        abierto={!!edicion}
        titulo="Editar Tema"
        onCerrar={() => setEdicion(null)}
        pie={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setEdicion(null)}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={guardarEdicion}>
              Guardar
            </button>
          </>
        }
      >
        {edicion && (
          <>
            <div className="mb-3">
              <label className="form-label" htmlFor="edit-nombre">Nombre del Tema</label>
              <input type="text" className="form-control" id="edit-nombre" value={edicion.nombre} onChange={cambiarEdicion('nombre')} />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="edit-competencia">Competencia</label>
              <input type="text" className="form-control" id="edit-competencia" value={edicion.competencia} onChange={cambiarEdicion('competencia')} />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="edit-area">Área</label>
              <select className="form-select" id="edit-area" value={edicion.codArea} onChange={cambiarEdicion('codArea')}>
                {areas.map((a) => (
                  <option key={a.CodArea} value={a.CodArea}>
                    {a.NombreArea}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
