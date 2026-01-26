import { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import './Countdown.css';

function Countdown({ onComplete }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        setCount(count - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown complete, wait a moment then call onComplete
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [count, onComplete]);

  return (
    <div className="countdown">
      <div className="countdown-number">{count > 0 ? count : 'GO!'}</div>
    </div>
  );
}

export default Countdown;
