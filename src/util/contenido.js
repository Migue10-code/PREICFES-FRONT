// Contenido de la página de inicio (el mismo para estudiante y administrador).

export const SLIDES = [
  {
    clase: 'slide-azul',
    img: 'hero-hojas.svg',
    alt: 'Hoja de respuestas con burbujas y un lápiz',
    titulo: 'Practica para el ICFES con simulacros',
    texto: 'Resuelve preguntas organizadas por área y llega al examen con más seguridad.',
    boton: 'Ver las áreas',
    destino: '#areas'
  },
  {
    clase: 'slide-violeta',
    img: 'hero-progreso.svg',
    alt: 'Gráfico de barras con el progreso por área',
    titulo: 'Mide tu avance en cada área',
    texto: 'Revisa tus resultados después de cada simulacro y descubre qué debes reforzar.',
    boton: 'Cómo funciona',
    destino: '#como-funciona'
  },
  {
    clase: 'slide-verde',
    img: 'hero-estudio.svg',
    alt: 'Computador con una pregunta de opción múltiple y un reloj',
    titulo: 'Estudia a tu ritmo',
    texto: 'Entra cuando quieras y practica desde el computador o el celular.',
    boton: 'Ver las áreas',
    destino: '#areas'
  }
];

// codArea coincide exactamente con los IDs de la base de datos
export const AREAS = [
  { icono: 'mdi-calculator-variant', color: 'c-violeta', nombre: 'Matemáticas',
    texto: 'Resuelve problemas con razonamiento cuantitativo, álgebra, geometría y estadística.', codArea: 1 },
  { icono: 'mdi-book-open-variant', color: 'c-azul', nombre: 'Lectura Crítica',
    texto: 'Comprende, interpreta y evalúa textos de distintos tipos.', codArea: 2 },
  { icono: 'mdi-flask', color: 'c-verde', nombre: 'Ciencias Naturales',
    texto: 'Aplica conceptos de biología, química y física para explicar fenómenos.', codArea: 3 },
  { icono: 'mdi-earth', color: 'c-naranja', nombre: 'Sociales y Ciudadanas',
    texto: 'Analiza situaciones históricas, sociales y de participación ciudadana.', codArea: 4 },
  { icono: 'mdi-translate', color: 'c-rojo', nombre: 'Inglés',
    texto: 'Practica la comprensión de lectura y el uso del idioma.', codArea: 5 }
];

export const PASOS = [
  { titulo: 'Elige un área', texto: 'Escoge el área que quieres practicar o inicia un simulacro completo.' },
  { titulo: 'Resuelve el simulacro', texto: 'Responde las preguntas a tu ritmo, con el mismo formato del examen.' },
  { titulo: 'Revisa tus resultados', texto: 'Mira tu puntaje, tus aciertos y las áreas donde puedes mejorar.' }
];
