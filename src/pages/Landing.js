import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import Button from '../components/Button';
import CreateRoomModal from '../components/CreateRoomModal';
import Modal from '../components/Modal';
import './Landing.css';

function Landing({ gameState }) {
  const { nickname, setNickname, nicknameColour, setNicknameColour, saveNicknameAndColour, createRoom, joinRoom } = gameState;
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
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

  const handleNicknameChange = (e) => {
    setNickname(e.target.value);
  };

  const handleColourChange = (e) => {
    setNicknameColour(e.target.value);
  };

  const handleSave = () => {
    saveNicknameAndColour();
  };

  const handleCreate = (e) => {
    if (!nickname.trim()) {
      return;
    }
    setIsCreateRoomModalOpen(true);
  };

  const handleCreateRoom = async (settings) => {
    try {
      const code = await createRoom(settings);
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
    if (!nickname.trim()) {
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
    if (!nickname.trim()) {
      return;
    }
    // TODO: Implement practice mode functionality
    console.log('Practice mode with nickname:', nickname);
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
      <Button
        variant="secondary"
        className="info-button-landing"
        onClick={() => setIsHowToPlayOpen(true)}
      >
        How to Play
      </Button>

      <div className="landing-container">
        <div className="landing-content">
          <h1 ref={titleRef} className="landing-title">Color Rush</h1>
          
          <div className="landing-form">
            <div className="input-group">
              <label htmlFor="nickname" className="input-label">
                Nickname
              </label>
              <input
                ref={inputRef}
                id="nickname"
                type="text"
                className="input-field"
                placeholder="Enter your nickname"
                value={nickname}
                onChange={handleNicknameChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>
            <div className="input-group">
              <label htmlFor="nickname-colour" className="input-label">
                Nickname Colour
              </label>
              <div className="colour-picker-container">
                <input
                  id="nickname-colour"
                  type="color"
                  className="colour-picker"
                  value={nicknameColour}
                  onChange={handleColourChange}
                />
                <span className="colour-preview" style={{ color: nicknameColour }}>
                  {nickname || 'Preview'}
                </span>
              </div>
            </div>

            <div className="save-button-container">
              <Button
                variant="secondary"
                className="btn-save"
                onClick={handleSave}
                disabled={!nickname.trim()}
              >
                Save Nickname
              </Button>
            </div>

            <div ref={buttonGroupRef} className="button-group">
              <Button 
                variant="primary"
                className="btn-create"
                onClick={handleCreate}
                disabled={!nickname.trim()}
              >
                Create Room
              </Button>
              <Button 
                variant="primary"
                className="btn-join"
                onClick={handleJoin}
                disabled={!nickname.trim()}
              >
                Join Room
              </Button>
              <Button 
                variant="primary"
                className="btn-practice"
                onClick={handlePractice}
                disabled={!nickname.trim()}
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
        nickname={nickname}
      />

      <Modal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
        title="How to Play"
      >
        <div className="how-to-play-content">
          <p className="how-to-play-intro">
            Color Rush is a fast-paced brain teaser where you race against time and other players!
          </p>
          
          <h3>The Challenge</h3>
          <p>
            You'll see a color word (like "RED") displayed in a different color (like blue text).
          </p>

          <h3>Two Instructions</h3>
          <p>The game alternates between two commands:</p>
          <ul>
            <li><strong>"Click the WORD!"</strong> → Click what the text says (RED)</li>
            <li><strong>"Click the COLOR!"</strong> → Click what color the text is (BLUE)</li>
          </ul>

          <h3>Game Speed</h3>
          <p>
            Game speed controls how quickly the color words appear and change. 
            A higher speed means faster gameplay and less time to react, making it more challenging!
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default Landing;
