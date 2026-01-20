import { useEffect, useRef } from 'react';
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

  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e);
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
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
