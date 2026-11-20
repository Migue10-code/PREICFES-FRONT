import { useEffect } from 'react';
import { createPortal } from 'react-dom';

// Ventana emergente con el estilo de Bootstrap (sin usar el JavaScript de Bootstrap).
// <Modal abierto={..} titulo="Editar" onCerrar={..} grande pie={<botones/>}> contenido </Modal>
export default function Modal({ abierto, titulo, onCerrar, grande = false, pie, children }) {
  useEffect(() => {
    if (!abierto) return undefined;
    document.body.classList.add('modal-open');
    const alTeclear = (e) => {
      if (e.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', alTeclear);
    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', alTeclear);
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return createPortal(
    <>
      <div
        className="modal fade show"
        style={{ display: 'block', overflowY: 'auto' }}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onCerrar();
        }}
      >
        <div className={`modal-dialog${grande ? ' modal-lg' : ''}`}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{titulo}</h5>
              <button type="button" className="btn-close" aria-label="Cerrar" onClick={onCerrar} />
            </div>
            <div className="modal-body">{children}</div>
            {pie && <div className="modal-footer">{pie}</div>}
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>,
    document.body
  );
}
