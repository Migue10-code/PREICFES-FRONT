import { useCallback, useEffect, useState } from 'react';
import { actualizarUsuario, crearUsuario, eliminarUsuario, getUsuarios } from '../../api/api';
import Modal from '../../components/Modal';
import { useTitulo } from '../../hooks/useTitulo';

const NUEVO = { nombre: '', correo: '', clave: '', confirmar: '' };

export default function Usuarios() {
  useTitulo('Registro de Usuarios');

  const [form, setForm] = useState(NUEVO);
  const [mensaje, setMensaje] = useState(null); // { texto, color }
  const [usuarios, setUsuarios] = useState(null); // null = cargando
  const [edicion, setEdicion] = useState(null);

  const cargarTabla = useCallback(() => {
    getUsuarios()
      .then(setUsuarios)
      .catch(() => setUsuarios([]));
  }, []);

  useEffect(() => {
    cargarTabla();
  }, [cargarTabla]);

  const cambiar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const guardar = async () => {
    if (form.clave !== form.confirmar) {
      setMensaje({ texto: 'Las contraseñas no coinciden.', color: 'red' });
      return;
    }
    const data = {
      NombreUsuario: form.nombre.trim(),
      Correo: form.correo.trim(),
      Contraseña: form.clave,
      CodEstudiante: null
    };
    if (!data.NombreUsuario || !data.Correo || !data.Contraseña) {
      setMensaje({ texto: 'Completa todos los campos.', color: 'red' });
      return;
    }
    try {
      await crearUsuario(data);
      setMensaje({ texto: 'Usuario guardado.', color: 'green' });
      setForm(NUEVO);
      cargarTabla();
    } catch (e) {
      setMensaje({ texto: 'Error al guardar.', color: 'red' });
    }
  };

  const abrirEditar = (u) => {
    setEdicion({ CodUsuario: u.CodUsuario, nombre: u.NombreUsuario, correo: u.Correo, clave: '' });
  };

  const cambiarEdicion = (campo) => (e) => setEdicion((d) => ({ ...d, [campo]: e.target.value }));

  const guardarEdicion = async () => {
    const data = {
      NombreUsuario: edicion.nombre.trim(),
      Correo: edicion.correo.trim()
    };
    if (edicion.clave) data.Contraseña = edicion.clave;
    try {
      await actualizarUsuario(edicion.CodUsuario, data);
      setEdicion(null);
      cargarTabla();
    } catch (e) {
      window.alert('Error al guardar.');
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    try {
      await eliminarUsuario(id);
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
            <h2>Registro de Usuarios</h2>
          </div>

          <div className="card-style mb-30">
            <h6 className="mb-25">Nuevo Usuario</h6>
            <div className="input-style-1">
              <label htmlFor="nombreUsuario">Nombre de usuario</label>
              <input type="text" id="nombreUsuario" placeholder="Ej. mhajin123" value={form.nombre} onChange={cambiar('nombre')} />
            </div>
            <div className="input-style-1">
              <label htmlFor="correoUsuario">Correo</label>
              <input type="text" id="correoUsuario" placeholder="abc123@gmail.com" value={form.correo} onChange={cambiar('correo')} />
            </div>
            <div className="input-style-1">
              <label htmlFor="claveUsuario">Contraseña</label>
              <input type="password" id="claveUsuario" placeholder="Ej. mateo2008" value={form.clave} onChange={cambiar('clave')} />
            </div>
            <div className="input-style-1">
              <label htmlFor="claveConfirm">Confirmar Contraseña</label>
              <input type="password" id="claveConfirm" placeholder="Ej. mateo2008" value={form.confirmar} onChange={cambiar('confirmar')} />
            </div>
            <button type="button" className="main-btn success-btn-outline btn-hover mt-10" onClick={guardar}>
              Guardar Usuario
            </button>
            <p style={{ marginTop: 10, color: mensaje?.color }}>{mensaje?.texto}</p>
          </div>

          <div className="card-style mb-30">
            <h6 className="mb-25">Usuarios registrados</h6>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios === null && (
                    <tr>
                      <td colSpan="4">Cargando...</td>
                    </tr>
                  )}
                  {usuarios !== null && usuarios.length === 0 && (
                    <tr>
                      <td colSpan="4">Sin registros</td>
                    </tr>
                  )}
                  {usuarios !== null &&
                    usuarios.map((u, i) => (
                      <tr key={u.CodUsuario}>
                        <td>{i + 1}</td>
                        <td>{u.NombreUsuario}</td>
                        <td>{u.Correo}</td>
                        <td>
                          <button type="button" className="btn btn-sm btn-warning me-1" onClick={() => abrirEditar(u)}>
                            ✏️ Editar
                          </button>
                          <button type="button" className="btn btn-sm btn-danger" onClick={() => eliminar(u.CodUsuario)}>
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
        titulo="Editar Usuario"
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
              <label className="form-label" htmlFor="edit-nombre">Nombre de usuario</label>
              <input type="text" className="form-control" id="edit-nombre" value={edicion.nombre} onChange={cambiarEdicion('nombre')} />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="edit-correo">Correo</label>
              <input type="text" className="form-control" id="edit-correo" value={edicion.correo} onChange={cambiarEdicion('correo')} />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="edit-clave">Nueva contraseña (dejar vacío para no cambiar)</label>
              <input type="password" className="form-control" id="edit-clave" value={edicion.clave} onChange={cambiarEdicion('clave')} />
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
