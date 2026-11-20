// Ruta de un archivo dentro de public/assets (imágenes, fuentes, css).
// Ejemplo: asset('images/logo/preicfes.svg')
export const asset = (ruta) => `${import.meta.env.BASE_URL}assets/${ruta}`;
