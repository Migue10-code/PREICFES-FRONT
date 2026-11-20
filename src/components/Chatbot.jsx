import { Fragment, useEffect, useRef, useState } from 'react';
import { enviarMensajeChat } from '../api/api';

// Asistente de estudio (chatbot) de PREICFES: botón flotante + ventana de chat que habla
// con POST /api/chat del backend. Usa las clases de assets/css/chat.css.
const CLAVE = 'pf_chat_historial';
const MAX_GUARDADOS = 40;

const SUGERENCIAS = [
  'Explícame cómo sacar porcentajes',
  '¿Cómo mejoro en Lectura crítica?',
  'Dame un consejo para manejar el tiempo en el examen',
  'Ayúdame con una pregunta de Ciencias naturales'
];

const BIENVENIDA =
  '¡Hola! Soy tu asistente de estudio. Pregúntame lo que quieras sobre **Lectura crítica, Matemáticas, Sociales, Ciencias naturales o Inglés**.';

function cargarMensajes() {
  try {
    const datos = JSON.parse(sessionStorage.getItem(CLAVE) || '[]');
    return Array.isArray(datos) ? datos : [];
  } catch (e) {
    return [];
  }
}

// Formato mínimo y seguro (negrita, código, viñetas) con JSX: nunca se inserta HTML.
function renderizarTexto(texto) {
  return String(texto)
    .split('\n')
    .map((linea, i) => {
      const conVineta = linea.replace(/^\s*[*-]\s+/, '• ');
      const trozos = conVineta.split(/(\*\*.+?\*\*|`[^`]+`)/g).filter((t) => t !== '');
      return (
        <Fragment key={i}>
          {i > 0 && <br />}
          {trozos.map((t, j) => {
            if (t.startsWith('**') && t.endsWith('**') && t.length > 4) {
              return <strong key={j}>{t.slice(2, -2)}</strong>;
            }
            if (t.startsWith('`') && t.endsWith('`') && t.length > 2) {
              return <code key={j}>{t.slice(1, -1)}</code>;
            }
            return <Fragment key={j}>{t}</Fragment>;
          })}
        </Fragment>
      );
    });
}

const IconoChat = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />
  </svg>
);
const IconoCerrar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
const IconoNuevo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v5h5" />
  </svg>
);
const IconoEnviar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 2L11 13" />
    <path d="M22 2l-7 20-4-9-9-4z" />
  </svg>
);

export default function Chatbot() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState(cargarMensajes); // [{ rol: 'usuario'|'bot'|'error', texto }]
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);

  const botonRef = useRef(null);
  const campoRef = useRef(null);
  const listaRef = useRef(null);

  // Guardar la conversación para que sobreviva al cambiar de página
  useEffect(() => {
    try {
      sessionStorage.setItem(CLAVE, JSON.stringify(mensajes.slice(-MAX_GUARDADOS)));
    } catch (e) {
      // sin almacenamiento: el chat funciona igual, solo no recuerda la conversación
    }
  }, [mensajes]);

  // Bajar al último mensaje
  useEffect(() => {
    if (abierto && listaRef.current) listaRef.current.scrollTop = listaRef.current.scrollHeight;
  }, [mensajes, enviando, abierto]);

  // Al abrir, enfocar el campo
  useEffect(() => {
    if (abierto && campoRef.current) campoRef.current.focus();
  }, [abierto]);

  // Escape cierra el chat
  useEffect(() => {
    if (!abierto) return undefined;
    const alTeclear = (e) => {
      if (e.key === 'Escape') {
        setAbierto(false);
        if (botonRef.current) botonRef.current.focus();
      }
    };
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [abierto]);

  const cerrar = () => {
    setAbierto(false);
    if (botonRef.current) botonRef.current.focus();
  };

  const reiniciar = () => {
    if (enviando) return;
    setMensajes([]);
    if (campoRef.current) campoRef.current.focus();
  };

  const enviar = async (pregunta) => {
    const mensaje = (pregunta || '').trim();
    if (!mensaje || enviando) return;

    // Contexto: los últimos mensajes de la conversación (sin los errores)
    const historial = mensajes
      .filter((m) => m.rol === 'usuario' || m.rol === 'bot')
      .slice(-10)
      .map((m) => ({ rol: m.rol, texto: m.texto }));

    setMensajes((previos) => [...previos, { rol: 'usuario', texto: mensaje }]);
    setTexto('');
    setEnviando(true);

    try {
      const cuerpo = await enviarMensajeChat(mensaje, historial);
      setMensajes((previos) => [...previos, { rol: 'bot', texto: cuerpo.respuesta }]);
    } catch (e) {
      const texto =
        e && e.status
          ? (e.cuerpo && e.cuerpo.mensaje) || 'No pude responder ahora. Intenta de nuevo.'
          : 'No se pudo conectar con el servidor.';
      setMensajes((previos) => [...previos, { rol: 'error', texto }]);
    } finally {
      setEnviando(false);
      if (campoRef.current) campoRef.current.focus();
    }
  };

  return (
    <>
      <section
        className={`pf-chat${abierto ? ' pf-abierto' : ''}`}
        role="dialog"
        aria-label="Asistente de estudio PREICFES"
      >
        <div className="pf-chat-cabecera">
          <div className="pf-icono" aria-hidden="true">
            P
          </div>
          <div className="pf-titulo">
            <strong>Asistente PREICFES</strong>
            <span>Te ayudo a prepararte para el ICFES</span>
          </div>
          <button type="button" title="Nueva conversación" aria-label="Nueva conversación" onClick={reiniciar}>
            <IconoNuevo />
          </button>
          <button type="button" title="Cerrar" aria-label="Cerrar asistente" onClick={cerrar}>
            <IconoCerrar />
          </button>
        </div>

        <div className="pf-mensajes" aria-live="polite" ref={listaRef}>
          {mensajes.length === 0 ? (
            <>
              <div className="pf-msg pf-bot">{renderizarTexto(BIENVENIDA)}</div>
              <div className="pf-sugerencias">
                {SUGERENCIAS.map((s) => (
                  <button key={s} type="button" onClick={() => enviar(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </>
          ) : (
            mensajes.map((m, i) => (
              <div
                key={i}
                className={`pf-msg ${m.rol === 'usuario' ? 'pf-usuario' : m.rol === 'error' ? 'pf-error' : 'pf-bot'}`}
              >
                {m.rol === 'usuario' ? m.texto : renderizarTexto(m.texto)}
              </div>
            ))
          )}
          {enviando && (
            <div className="pf-msg pf-bot pf-escribiendo" aria-label="El asistente está escribiendo">
              <i></i>
              <i></i>
              <i></i>
            </div>
          )}
        </div>

        <form
          className="pf-form"
          onSubmit={(e) => {
            e.preventDefault();
            enviar(texto);
          }}
        >
          <input
            type="text"
            ref={campoRef}
            value={texto}
            maxLength={1000}
            placeholder="Escribe tu pregunta…"
            aria-label="Tu pregunta"
            autoComplete="off"
            onChange={(e) => setTexto(e.target.value)}
          />
          <button type="submit" aria-label="Enviar" disabled={enviando}>
            <IconoEnviar />
          </button>
        </form>

        <p className="pf-aviso">Es una IA: puede equivocarse. Verifica lo importante.</p>
      </section>

      <button
        type="button"
        ref={botonRef}
        className="pf-chat-btn"
        aria-label="Abrir asistente de estudio"
        aria-expanded={abierto}
        onClick={() => setAbierto((v) => !v)}
      >
        <IconoChat />
        <span className="pf-punto"></span>
      </button>
    </>
  );
}
