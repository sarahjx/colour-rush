import { useRef } from 'react';
import { gsap } from 'gsap';
import './Button.css';

function Button({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary',
  className = '',
  type = 'button',
  ...props 
}) {
  const buttonRef = useRef(null);

  // JavaScript event handlers
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) {
      return;
    }

    if (onClick && typeof onClick === 'function') {
      onClick(e);
    } else {
      console.warn('Button onClick is not a function:', onClick);
    }
  };

  const handleMouseEnter = () => {
    if (!disabled && buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 1.05,
        duration: 0.2,
        ease: 'power2.out'
      });
    }
  };

  const handleMouseLeave = () => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out'
      });
    }
  };

  return (
    <button
      ref={buttonRef}
      type={type}
      className={`btn btn-${variant} ${className}`.trim()}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      style={{ 
        pointerEvents: disabled ? 'none' : 'auto',
        cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative',
        zIndex: 1000
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
