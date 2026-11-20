import { useCallback, useEffect, useState } from 'react';
import {
  actualizarEstudiante,
  crearEstudiante,
  eliminarEstudiante,
  getEstudiantes
} from '../../api/api';
import Modal from '../../components/Modal';
import { useTitulo } from '../../hooks/useTitulo';

const NUEVO = { nombre: '', apellido: '', grado: '', seccion: '', documento: '' };

export default function Estudiantes() {
  useTitulo('Registro de Estudiantes');

  const [form, setForm] = useState(NUEVO);
  const [mensaje, setMensaje] = useState(null); // { texto, color }
  const [estudiantes, setEstudiantes] = useState(null); // null = cargando
  const [edicion, setEdicion] = useState(null); // { CodEstudiante, Nombre, ... } | null

  const cargarTabla = useCallback(() => {
    getEstudiantes()
      .then(setEstudiantes)
      .catch(() => setEstudiantes([]));
  }, []);

  useEffect(() => {
    cargarTabla();
  }, [cargarTabla]);

  const cambiar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const guardar = async () => {
    const data = {
      Nombre: form.nombre.trim(),
      Apellido: form.apellido.trim(),
      Grado: form.grado,
      Seccion: form.seccion,
      DocDeIdentidad: form.documento.trim()
    };
    if (!data.Nombre || !data.Apellido || !data.Grado || !data.Seccion || !data.DocDeIdentidad) {
      setMensaje({ texto: 'Completa todos los campos.', color: 'red' });
      return;
    }
    try {
      await crearEstudiante(data);
      setMensaje({ texto: 'Estudiante guardado.', color: 'green' });
      setForm((f) => ({ ...f, nombre: '', apellido: '', documento: '' }));
      cargarTabla();
    } catch (e) {
      setMensaje({ texto: 'Error al guardar.', color: 'red' });
    }
  };

  const abrirEditar = (e) => {
    setEdicion({
      CodEstudiante: e.CodEstudiante,
      nombre: e.Nombre,
      apellido: e.Apellido,
      grado: String(e.Grado),
      seccion: String(e.Seccion),
      documento: e.DocDeIdentidad
    });
  };

  const cambiarEdicion = (campo) => (e) => setEdicion((d) => ({ ...d, [campo]: e.target.value }));

  const guardarEdicion = async () => {
    try {
      await actualizarEstudiante(edicion.CodEstudiante, {
        Nombre: edicion.nombre.trim(),
        Apellido: edicion.apellido.trim(),
        Grado: edicion.grado,
        Seccion: edicion.seccion,
        DocDeIdentidad: edicion.documento.trim()
      });
      setEdicion(null);
      cargarTabla();
    } catch (e) {
      window.alert('Error al guardar.');
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este estudiante?')) return;
    try {
      await eliminarEstudiante(id);
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
            <h2>Registro Estudiantes</h2>
          </div>

          <div className="card-style mb-30">
            <h6 className="mb-25">Nuevo Estudiante</h6>
            <div className="input-style-1">
              <label htmlFor="nombre">Nombre</label>
              <input type="text" id="nombre" placeholder="Ej. James" value={form.nombre} onChange={cambiar('nombre')} />
            </div>
            <div className="input-style-1">
              <label htmlFor="apellido">Apellido</label>
              <input type="text" id="apellido" placeholder="Ej. Rodriguez" value={form.apellido} onChange={cambiar('apellido')} />
            </div>
            <div className="select-style-1">
              <label htmlFor="grado">Grado</label>
              <div className="select-position">
                <select id="grado" value={form.grado} onChange={cambiar('grado')}>
                  <option value="">Selecciona tu Grado</option>
                  <option value="9">9°</option>
                  <option value="10">10°</option>
                  <option value="11">11°</option>
                </select>
              </div>
            </div>
            <div className="select-style-1">
              <label htmlFor="seccion">Sección</label>
              <div className="select-position">
                <select id="seccion" value={form.seccion} onChange={cambiar('seccion')}>
                  <option value="">Selecciona la Sección</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
            </div>
            <div className="input-style-1">
              <label htmlFor="documento">Número de Documento</label>
              <input type="text" id="documento" value={form.documento} onChange={cambiar('documento')} />
            </div>
            <button type="button" className="main-btn active-btn-outline btn-hover mt-10" onClick={guardar}>
              Guardar Estudiante
            </button>
            <p style={{ marginTop: 10, color: mensaje?.color }}>{mensaje?.texto}</p>
          </div>

          <div className="card-style mb-30">
            <h6 className="mb-25">Estudiantes registrados</h6>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Grado</th>
                    <th>Sección</th>
                    <th>Documento</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {estudiantes === null && (
                    <tr>
                      <td colSpan="7">Cargando...</td>
                    </tr>
                  )}
                  {estudiantes !== null && estudiantes.length === 0 && (
                    <tr>
                      <td colSpan="7">Sin registros</td>
                    </tr>
                  )}
                  {estudiantes !== null &&
                    estudiantes.map((e, i) => (
                      <tr key={e.CodEstudiante}>
                        <td>{i + 1}</td>
                        <td>{e.Nombre}</td>
                        <td>{e.Apellido}</td>
                        <td>{e.Grado}</td>
                        <td>{e.Seccion}</td>
                        <td>{e.DocDeIdentidad}</td>
                        <td>
                          <button type="button" className="btn btn-sm btn-warning me-1" onClick={() => abrirEditar(e)}>
                            ✏️ Editar
                          </button>
                          <button type="button" className="btn btn-sm btn-danger" onClick={() => eliminar(e.CodEstudiante)}>
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
        titulo="Editar Estudiante"
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
              <label className="form-label" htmlFor="edit-nombre">Nombre</label>
              <input type="text" className="form-control" id="edit-nombre" value={edicion.nombre} onChange={cambiarEdicion('nombre')} />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="edit-apellido">Apellido</label>
              <input type="text" className="form-control" id="edit-apellido" value={edicion.apellido} onChange={cambiarEdicion('apellido')} />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="edit-grado">Grado</label>
              <select className="form-select" id="edit-grado" value={edicion.grado} onChange={cambiarEdicion('grado')}>
                <option value="9">9°</option>
                <option value="10">10°</option>
                <option value="11">11°</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="edit-seccion">Sección</label>
              <select className="form-select" id="edit-seccion" value={edicion.seccion} onChange={cambiarEdicion('seccion')}>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="edit-documento">Documento</label>
              <input type="text" className="form-control" id="edit-documento" value={edicion.documento} onChange={cambiarEdicion('documento')} />
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
