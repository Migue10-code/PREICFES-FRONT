import { useNavigate } from 'react-router-dom';
import Carousel from '../../components/Carousel';
import { useTitulo } from '../../hooks/useTitulo';
import { AREAS, PASOS, SLIDES } from '../../util/contenido';

// Inicio del estudiante: slider, áreas del examen y cómo funciona.
export default function Inicio() {
  useTitulo('Inicio');
  const navegar = useNavigate();

  const irAlSimulacro = (codArea) => navegar(`/estudiante/simulacro?area=${codArea}`);

  return (
    <section className="section">
      <div className="container-fluid pt-30">
        <div id="inicio" className="inicio">
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
                    role="link"
                    tabIndex={0}
                    onClick={() => irAlSimulacro(a.codArea)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        irAlSimulacro(a.codArea);
                      }
                    }}
                  >
                    <div className={`icono ${a.color}`}>
                      <i className={`mdi ${a.icono}`}></i>
                    </div>
                    <h5>{a.nombre}</h5>
                    <p>{a.texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="como-funciona" className="inicio-seccion">
            <h3>Cómo funciona</h3>
            <p className="inicio-sub">Tres pasos para practicar y mejorar.</p>
            <div className="row g-4">
              {PASOS.map((p, i) => (
                <div key={p.titulo} className="col-12 col-md-4">
                  <div className="tarjeta paso">
                    <div className="numero">{i + 1}</div>
                    <h5>{p.titulo}</h5>
                    <p>{p.texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
