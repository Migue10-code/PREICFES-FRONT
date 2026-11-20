// La base de datos guarda algunos textos entre comillas simples ('Correcta', '¿Cuánto es...?').
// Esta función las quita solo para mostrarlos o compararlos.
export function limpiarComillas(texto) {
  if (!texto) return '';
  return String(texto).replace(/^'|'$/g, '');
}

export function normalizarRol(rol) {
  const valor = String(rol || '').trim().toLowerCase();
  if (valor === 'admin' || valor === 'administrador') return 'administrador';
  if (valor === 'estudiante') return 'estudiante';
  return '';
}
