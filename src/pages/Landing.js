import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import Button from '../components/Button';
import './Landing.css';

function Landing({ gameState }) {
  const { username, setUsername, createRoom, joinRoom } = gameState;
  const titleRef = useRef(null);
  const buttonGroupRef = useRef(null);
  const inputRef = useRef(null);

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

  const handleCreate = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!username.trim()) {
      return;
    }

    try {
      const roomCode = await createRoom();
      console.log('Room created with code:', roomCode);
      // Navigation handled by App.js when gameStatus changes to 'waiting'
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const handleJoin = () => {
    // TODO: Get room code from user input
    const roomCode = prompt('Enter room code:');
    if (roomCode) {
      joinRoom(roomCode);
      console.log('Joined room:', roomCode);
    }
  };

  const handlePractice = () => {
    // TODO: Implement practice mode functionality
    console.log('Practice mode with username:', username);
  };

  const handleInputFocus = () => {
    if (inputRef.current) {
      gsap.to(inputRef.current, {
        scale: 1.02,
        duration: 0.3,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1
      });
    }
  };

  const handleInputBlur = () => {
    if (inputRef.current) {
      gsap.to(inputRef.current, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out'
      });
    }
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
                ref={inputRef}
                id="username"
                type="text"
                className="input-field"
                placeholder="Enter your username"
                value={username}
                onChange={handleUsernameChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>

            <div ref={buttonGroupRef} className="button-group">
              <Button 
                variant="primary"
                className="btn-create"
                onClick={handleCreate}
                disabled={!username.trim()}
              >
                Create Room
              </Button>
              <Button 
                variant="primary"
                className="btn-join"
                onClick={handleJoin}
                disabled={!username.trim()}
              >
                Join Room
              </Button>
              <Button 
                variant="primary"
                className="btn-practice"
                onClick={handlePractice}
                disabled={!username.trim()}
              >
                Practice
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;
