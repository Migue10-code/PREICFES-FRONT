# PREICFES — Frontend en React

Misma plataforma de siempre (portada, login, registro, panel de estudiante y panel de administrador),
ahora hecha con **React 18 + Vite + React Router**, usando el mismo backend (Node/Express/MySQL).

## Cómo correrlo
1. Instala Node 18 o superior.
2. En esta carpeta: `npm install`
3. Enciende el backend (carpeta del back, `node server.js`, puerto 3000).
4. `npm run dev` y abre http://localhost:5173

Si tu backend está en otra dirección, copia `.env.example` a `.env` y cambia `VITE_API_URL`.

## Para entregar / publicar
`npm run build` genera la carpeta `dist/` (sitio listo para subir).

## Estructura
- `public/assets/` → el CSS, fuentes e imágenes originales (no se perdió ningún estilo)
- `src/api/api.js` → todas las llamadas al backend
- `src/auth/` → sesión (login/logout) y protección de rutas por rol
- `src/components/` → piezas reutilizables (PanelLayout, Modal, Carousel, Chatbot, Burbujas…)
- `src/pages/` → Landing, Login, Registro, `estudiante/*` y `admin/*`
- `src/hooks/useEstilos.js` → carga el CSS correcto de cada pantalla

## Chatbot de IA
Está en `src/components/Chatbot.jsx` (solo en el panel del estudiante) y habla con `POST /api/chat`
del backend, que usa Gemini. Hay que poner `GEMINI_API_KEY` en el `.env` del backend.
