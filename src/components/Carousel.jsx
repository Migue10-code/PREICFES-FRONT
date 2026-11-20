import { useEffect, useState } from 'react';
import { asset } from '../util/rutas';

// Slider de la página de inicio (estudiante y administrador). Usa las clases de Bootstrap
// y de inicio.css, pero el cambio de diapositivas lo maneja React.
export default function Carousel({ slides, intervalo = 6000 }) {
  const [actual, setActual] = useState(0);
  const [pausado, setPausado] = useState(false);

  const reducirMovimiento =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (reducirMovimiento || pausado) return undefined;
    const id = setInterval(() => setActual((i) => (i + 1) % slides.length), intervalo);
    return () => clearInterval(id);
  }, [slides.length, intervalo, pausado, reducirMovimiento]);

  const anterior = () => setActual((i) => (i - 1 + slides.length) % slides.length);
  const siguiente = () => setActual((i) => (i + 1) % slides.length);

  return (
    <div
      className="carousel slide inicio-carrusel"
      aria-label="Novedades de la plataforma"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      <div className="carousel-indicators">
        {slides.map((s, i) => (
          <button
            key={s.titulo}
            type="button"
            className={i === actual ? 'active' : ''}
            aria-current={i === actual ? 'true' : undefined}
            aria-label={`Diapositiva ${i + 1}`}
            onClick={() => setActual(i)}
          />
        ))}
      </div>

      <div className="carousel-inner">
        {slides.map((s, i) => (
          <div key={s.titulo} className={`carousel-item${i === actual ? ' active' : ''}`}>
            <div className={`inicio-slide ${s.clase} d-flex align-items-center`}>
              <div className="row align-items-center w-100 g-0">
                <div className="col-md-6">
                  <h2>{s.titulo}</h2>
                  <p>{s.texto}</p>
                  <a className="inicio-boton" href={s.destino}>
                    {s.boton}
                  </a>
                </div>
                <div className="col-md-6">
                  <img src={asset(`images/home/${s.img}`)} alt={s.alt} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="carousel-control-prev" type="button" onClick={anterior}>
        <span className="carousel-control-prev-icon" aria-hidden="true" />
        <span className="visually-hidden">Anterior</span>
      </button>
      <button className="carousel-control-next" type="button" onClick={siguiente}>
        <span className="carousel-control-next-icon" aria-hidden="true" />
        <span className="visually-hidden">Siguiente</span>
      </button>
    </div>
  );
}
