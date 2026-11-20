import { useEffect, useLayoutEffect, useRef, useState } from 'react';

// Arte de PREICFES (portada y login): una hoja de respuestas de burbujas donde las respuestas
// "marcadas" forman una escalera que sube hacia la respuesta correcta (el check amarillo).
// Se adapta al tamaño del panel y las burbujas se marcan una a una al cargar.
// Props opcionales (igual que antes): modo="ancho", x0={0.45}, subida={0.7}

// De la diagonal hacia adentro: amarillo, blanco y azules cada vez más profundos
const COLORES = ['#FFD23F', '#FFFFFF', '#BFD0FF', '#8CA9FF', '#5D82F5', '#3B5FE0'];

function calcular(w, h, modo, x0Prop, subidaProp) {
  // Cuadrícula con medio espacio de margen en todos los lados (ninguna burbuja queda cortada)
  const cols = Math.max(6, Math.round(w / Math.max(30, Math.min(66, w / 11))));
  const celda = w / cols;
  const filas = Math.max(3, Math.floor(h / celda));
  const oy = (h - filas * celda) / 2 + celda / 2;
  const radio = celda * 0.34;

  // Diagonal de la escalera. En un panel ancho y bajo (celular) arranca más a la derecha
  // para no tapar el logo.
  const ancho = modo ? modo === 'ancho' : w / h > 1.6;
  const x0 = x0Prop !== undefined ? x0Prop : ancho ? 0.3 : 0;
  const subida = subidaProp !== undefined ? subidaProp : ancho ? 0.62 : 0.88;

  const vacias = [];
  const llenas = [];
  let meta = null;

  for (let c = 0; c < cols; c++) {
    for (let f = 0; f < filas; f++) {
      const x = (c + 0.5) * celda;
      const y = oy + f * celda;
      const t = (x / w - x0) / (1 - x0);
      const dv = ((y / h - (1 - t * subida)) * h) / celda + 0.05;

      if (t < 0 || dv < 0) {
        vacias.push({ x, y, r: radio, k: `v${c}-${f}` });
        continue;
      }
      const d = Math.min(COLORES.length - 1, Math.floor(dv));
      const retraso = c * 38 + (filas - f) * 20;
      llenas.push({ x, y, r: radio * 1.04, color: COLORES[d], retraso, k: `l${c}-${f}` });
      // La meta: la burbuja amarilla más a la derecha que quepa entera con su aro
      if (d === 0 && x + celda * 0.62 <= w && y - celda * 0.62 >= 0 && (!meta || x > meta.x)) {
        meta = { x, y, retraso };
      }
    }
  }

  return { w, h, celda, radio, vacias, llenas, meta };
}

export default function Burbujas({ modo, x0, subida }) {
  const ref = useRef(null);
  const [dibujo, setDibujo] = useState(null);
  const [animar, setAnimar] = useState(true);
  const ultimoAncho = useRef(0);

  useLayoutEffect(() => {
    const caja = ref.current.getBoundingClientRect();
    if (!caja.width || !caja.height) return;
    ultimoAncho.current = caja.width;
    const reducir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setAnimar(!reducir);
    setDibujo(calcular(caja.width, caja.height, modo, x0, subida));
  }, [modo, x0, subida]);

  useEffect(() => {
    let temporizador;
    const alCambiarTamano = () => {
      clearTimeout(temporizador);
      temporizador = setTimeout(() => {
        const caja = ref.current && ref.current.getBoundingClientRect();
        if (caja && Math.abs(caja.width - ultimoAncho.current) > 20) {
          ultimoAncho.current = caja.width;
          setAnimar(false);
          setDibujo(calcular(caja.width, caja.height, modo, x0, subida));
        }
      }, 150);
    };
    window.addEventListener('resize', alCambiarTamano);
    return () => {
      clearTimeout(temporizador);
      window.removeEventListener('resize', alCambiarTamano);
    };
  }, [modo, x0, subida]);

  const r = dibujo ? dibujo.radio * 1.3 : 0;
  const m = dibujo && dibujo.meta;

  return (
    <svg
      id="burbujas"
      ref={ref}
      aria-hidden="true"
      className={animar ? undefined : 'sin-animacion'}
      viewBox={dibujo ? `0 0 ${dibujo.w.toFixed(0)} ${dibujo.h.toFixed(0)}` : undefined}
    >
      {dibujo && (
        <>
          <g fill="none" stroke="#FFFFFF" strokeOpacity=".16" strokeWidth="2">
            {dibujo.vacias.map((c) => (
              <circle key={c.k} cx={c.x.toFixed(1)} cy={c.y.toFixed(1)} r={c.r.toFixed(1)} />
            ))}
          </g>
          {dibujo.llenas.map((c) => (
            <circle
              key={c.k}
              className="relleno"
              style={{ animationDelay: `${c.retraso}ms` }}
              fill={c.color}
              cx={c.x.toFixed(1)}
              cy={c.y.toFixed(1)}
              r={c.r.toFixed(1)}
            />
          ))}
          {m && (
            <g className="relleno" style={{ animationDelay: `${m.retraso + 350}ms` }}>
              <circle
                cx={m.x.toFixed(1)}
                cy={m.y.toFixed(1)}
                r={(dibujo.celda * 0.6).toFixed(1)}
                fill="#0A1F66"
                stroke="#FFD23F"
                strokeOpacity=".55"
                strokeWidth="2"
              />
              <circle cx={m.x.toFixed(1)} cy={m.y.toFixed(1)} r={r.toFixed(1)} fill="#FFD23F" />
              <path
                d={`M${(m.x - r * 0.46).toFixed(1)} ${(m.y + r * 0.02).toFixed(1)} L${(m.x - r * 0.1).toFixed(1)} ${(
                  m.y + r * 0.38
                ).toFixed(1)} L${(m.x + r * 0.5).toFixed(1)} ${(m.y - r * 0.34).toFixed(1)}`}
                fill="none"
                stroke="#0A1F66"
                strokeWidth={(r * 0.26).toFixed(1)}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )}
        </>
      )}
    </svg>
  );
}
