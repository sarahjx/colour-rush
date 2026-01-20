import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './Modal.css';

function Modal({ isOpen, onClose, children, title }) {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';

      // Animate modal in
      if (overlayRef.current && modalRef.current) {
        gsap.fromTo(
          overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3 }
        );
        gsap.fromTo(
          modalRef.current,
          { opacity: 0, y: -20, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
        );
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={overlayRef}
      className="modal-overlay" 
      onClick={handleOverlayClick}
    >
      <div ref={modalRef} className="modal-content">
        {title && (
          <h2 className="modal-title">{title}</h2>
        )}
        <button 
          className="modal-close-btn" 
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
