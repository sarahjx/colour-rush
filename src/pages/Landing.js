import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import Button from '../components/Button';
import CreateRoomModal from '../components/CreateRoomModal';
import './Landing.css';

function Landing({ gameState }) {
  const { username, setUsername, createRoom, joinRoom } = gameState;
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
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

  const handleCreate = (e) => {
    if (!username.trim()) {
      return;
    }
    setIsCreateRoomModalOpen(true);
  };

  const handleCreateRoom = async () => {
    try {
      const code = await createRoom();
      return code;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  };

  const handleCloseModal = () => {
    setIsCreateRoomModalOpen(false);
  };

  const handleJoin = (e) => {
    if (!username.trim()) {
      return;
    }
    // TODO: Get room code from user input
    const roomCode = prompt('Enter room code:');
    if (roomCode && roomCode.trim()) {
      joinRoom(roomCode.trim());
      console.log('Joined room:', roomCode);
    }
  };

  const handlePractice = (e) => {
    if (!username.trim()) {
      return;
    }
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

      <CreateRoomModal
        isOpen={isCreateRoomModalOpen}
        onClose={handleCloseModal}
        onCreateRoom={handleCreateRoom}
        username={username}
      />
    </div>
  );
}

export default Landing;
