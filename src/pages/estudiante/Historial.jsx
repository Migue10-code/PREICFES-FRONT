import { useEffect, useState } from 'react';
import { getIntentosPorUsuario } from '../../api/api';
import { useAuth } from '../../auth/AuthContext';
import { useTitulo } from '../../hooks/useTitulo';

// Historial de simulacros del estudiante
export default function Historial() {
  useTitulo('Mi Historial');
  const { sesion } = useAuth();
  const codUsuario = sesion && sesion.CodUsuario;

  const [intentos, setIntentos] = useState(null); // null = cargando
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!codUsuario) return undefined;
    let vivo = true;
    getIntentosPorUsuario(codUsuario)
      .then((datos) => {
        if (vivo) setIntentos(datos);
      })
      .catch(() => {
        if (vivo) setError(true);
      });
    return () => {
      vivo = false;
    };
  }, [codUsuario]);

  let contenido;
  if (!codUsuario) {
    contenido = <p>No se pudo obtener la sesión.</p>;
  } else if (error) {
    contenido = <p style={{ color: 'red' }}>Error al cargar el historial.</p>;
  } else if (intentos === null) {
    contenido = <p>Cargando...</p>;
  } else if (intentos.length === 0) {
    contenido = <p style={{ color: '#888' }}>Aún no has realizado ningún simulacro.</p>;
  } else {
    contenido = (
      <table className="table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Puntaje</th>
          </tr>
        </thead>
        <tbody>
          {intentos.map((i) => (
            <tr key={i.CodIntento ?? `${i.Fecha}-${i.Puntaje}-${i.Descripcion}`}>
              <td>{i.Fecha}</td>
              <td>{i.Descripcion || '-'}</td>
              <td>{i.Puntaje}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <section className="section">
      <div className="container-fluid pt-30">
        <div className="title-wrapper">
          <h2>Mi Historial</h2>
          <p style={{ color: '#888' }}>Tus simulacros anteriores</p>
        </div>
        <div className="card-style mt-20">
          <div id="historial-contenido">{contenido}</div>
        </div>
      </div>
    </section>
  );
}
