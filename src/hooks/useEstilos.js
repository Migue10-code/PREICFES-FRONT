import { useEffect, useState } from 'react';

// Cada sección del sitio (portada, login, panel) tiene su propio CSS, y esos CSS
// no se llevan bien entre sí. Este hook carga las hojas de public/assets/css que
// necesite la pantalla y las quita al salir. Devuelve true cuando ya cargaron
// (así no se ve la página sin estilos por un instante).
const registro = new Map(); // href -> { link, usos, promesa, temporizador }

function tomar(href) {
  let entrada = registro.get(href);
  if (entrada) {
    clearTimeout(entrada.temporizador);
    entrada.usos += 1;
    return entrada.promesa;
  }
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  const promesa = new Promise((resolver) => {
    link.onload = resolver;
    link.onerror = resolver;
  });
  document.head.appendChild(link);
  registro.set(href, { link, usos: 1, promesa, temporizador: null });
  return promesa;
}

function soltar(href) {
  const entrada = registro.get(href);
  if (!entrada) return;
  entrada.usos -= 1;
  if (entrada.usos > 0) return;
  // Espera un momento por si la pantalla siguiente usa la misma hoja
  entrada.temporizador = setTimeout(() => {
    if (entrada.usos <= 0) {
      entrada.link.remove();
      registro.delete(href);
    }
  }, 80);
}

export function useEstilos(hojas) {
  const clave = hojas.join('|');
  const [listo, setListo] = useState(false);

  useEffect(() => {
    let vivo = true;
    const hrefs = clave.split('|').map((h) => `${import.meta.env.BASE_URL}assets/css/${h}`);
    Promise.all(hrefs.map(tomar)).then(() => {
      if (vivo) setListo(true);
    });
    return () => {
      vivo = false;
      hrefs.forEach(soltar);
    };
  }, [clave]);

  return listo;
}
