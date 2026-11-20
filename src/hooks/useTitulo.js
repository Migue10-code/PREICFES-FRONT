import { useEffect } from 'react';

// Cambia el título de la pestaña: useTitulo('Inicio') -> "Inicio | PREICFES"
export function useTitulo(titulo) {
  useEffect(() => {
    document.title = `${titulo} | PREICFES`;
  }, [titulo]);
}
