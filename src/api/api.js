// Todas las llamadas al backend (Node + Express) están aquí.
// La dirección se puede cambiar creando un archivo .env con VITE_API_URL=...
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export class ErrorApi extends Error {
  constructor(status, cuerpo) {
    super((cuerpo && cuerpo.mensaje) || `Error ${status}`);
    this.status = status;
    this.cuerpo = cuerpo || {};
  }
}

async function pedir(ruta, { metodo = 'GET', cuerpo } = {}) {
  const tieneCuerpo = cuerpo !== undefined;
  const res = await fetch(`${BASE}${ruta}`, {
    method: metodo,
    headers: tieneCuerpo ? { 'Content-Type': 'application/json' } : undefined,
    body: tieneCuerpo ? JSON.stringify(cuerpo) : undefined
  });
  const datos = await res.json().catch(() => ({}));
  if (!res.ok) throw new ErrorApi(res.status, datos);
  return datos;
}

const post = (ruta, cuerpo) => pedir(ruta, { metodo: 'POST', cuerpo });
const put = (ruta, cuerpo) => pedir(ruta, { metodo: 'PUT', cuerpo });
const borrar = (ruta) => pedir(ruta, { metodo: 'DELETE' });

// ── Sesión ──────────────────────────────────────────────
export const loginUsuario = (correo, clave, rol) =>
  post('/usuarios/login', { Correo: correo, Contraseña: clave, Rol: rol });
export const registrarUsuario = (datos) => post('/usuarios/registro', datos);

// ── Estudiantes ─────────────────────────────────────────
export const getEstudiantes = () => pedir('/estudiantes');
export const crearEstudiante = (datos) => post('/estudiantes', datos);
export const actualizarEstudiante = (id, datos) => put(`/estudiantes/${id}`, datos);
export const eliminarEstudiante = (id) => borrar(`/estudiantes/${id}`);

// ── Usuarios ────────────────────────────────────────────
export const getUsuarios = () => pedir('/usuarios');
export const crearUsuario = (datos) => post('/usuarios', datos);
export const actualizarUsuario = (id, datos) => put(`/usuarios/${id}`, datos);
export const eliminarUsuario = (id) => borrar(`/usuarios/${id}`);

// ── Áreas y temas ───────────────────────────────────────
export const getAreas = () => pedir('/areas');
export const getTemas = () => pedir('/temas');
export const crearTema = (datos) => post('/temas', datos);
export const actualizarTema = (id, datos) => put(`/temas/${id}`, datos);
export const eliminarTema = (id) => borrar(`/temas/${id}`);

// ── Preguntas ───────────────────────────────────────────
export const getPreguntas = () => pedir('/preguntas');
export const getPreguntaPorId = (id) => pedir(`/preguntas/${id}`);
export const getPreguntasPorArea = (codArea) => pedir(`/preguntas/porArea/${codArea}`);
export const getPreguntasPorTema = (codTema) => pedir(`/preguntas/porTema/${encodeURIComponent(codTema)}`);
export const getPreguntasAleatorio = () => pedir('/preguntas/aleatorio');
export const crearPregunta = (datos) => post('/preguntas', datos);
export const actualizarPregunta = (id, datos) => put(`/preguntas/${id}`, datos);
export const eliminarPregunta = (id) => borrar(`/preguntas/${id}`);

// ── Respuestas ──────────────────────────────────────────
export const getRespuestas = () => pedir('/respuestas');
export const getRespuestasPorPregunta = async (codPregunta) => {
  const todas = await getRespuestas();
  return todas.filter((r) => Number(r.CodPregunta) === Number(codPregunta));
};
export const crearRespuesta = (datos) => post('/respuestas', datos);
export const actualizarRespuesta = (id, datos) => put(`/respuestas/${id}`, datos);
export const eliminarRespuesta = (id) => borrar(`/respuestas/${id}`);

// Borra primero las respuestas de la pregunta y luego la pregunta
export async function eliminarPreguntaCompleta(codPregunta) {
  const respuestas = await getRespuestasPorPregunta(codPregunta);
  for (const r of respuestas) {
    await eliminarRespuesta(r.CodRespuesta);
  }
  return eliminarPregunta(codPregunta);
}

// ── Intentos (simulacros presentados) ───────────────────
export const getIntentos = () => pedir('/intentos');
export const getIntentosPorUsuario = async (codUsuario) => {
  const todos = await getIntentos();
  return todos.filter((i) => Number(i.CodUsuario) === Number(codUsuario));
};
export const crearIntento = (datos) => post('/intentos', datos);
export const crearIntentoRespuesta = (datos) => post('/intentosrespuestas', datos);

// ── Chatbot de IA ───────────────────────────────────────
// historial: [{ rol: 'usuario' | 'bot', texto }]
export const enviarMensajeChat = (mensaje, historial) => post('/chat', { mensaje, historial });
