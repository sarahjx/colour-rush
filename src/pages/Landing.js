import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import './Landing.css';

function Landing() {
  const [username, setUsername] = useState('');
  const titleRef = useRef(null);
  const buttonGroupRef = useRef(null);

  useEffect(() => {
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
      );
    }
  }, []);

  useEffect(() => {
    if (buttonGroupRef.current) {
      const buttons = buttonGroupRef.current.children;
      gsap.fromTo(
        buttons,
        { opacity: 0, y: 20, scale: 0.8 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.6, 
          ease: 'back.out(1.7)',
          stagger: 0.15,
          delay: 0.5
        }
      );
    }
  }, []);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleCreate = () => {
    // TODO: Implement create game functionality
    console.log('Create game with username:', username);
  };

  const handleJoin = () => {
    // TODO: Implement join game functionality
    console.log('Join game with username:', username);
  };

  const handlePractice = () => {
    // TODO: Implement practice mode functionality
    console.log('Practice mode with username:', username);
  };

  return (
    <div className="landing">
      <div className="landing-container">
        <div className="landing-content">
          <h1 ref={titleRef} className="landing-title">Color Rush</h1>
          
          <div className="landing-form">
            <div className="input-group">
              <label htmlFor="username" className="input-label">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="input-field"
                placeholder="Enter your username"
                value={username}
                onChange={handleUsernameChange}
              />
            </div>

            <div ref={buttonGroupRef} className="button-group">
              <button 
                className="btn btn-create" 
                onClick={handleCreate}
                disabled={!username.trim()}
              >
                Create
              </button>
              <button 
                className="btn btn-join" 
                onClick={handleJoin}
                disabled={!username.trim()}
              >
                Join
              </button>
              <button 
                className="btn btn-practice" 
                onClick={handlePractice}
                disabled={!username.trim()}
              >
                Practice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;
