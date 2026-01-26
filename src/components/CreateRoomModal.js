import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Modal from './Modal';
import Button from './Button';
import './CreateRoomModal.css';

function CreateRoomModal({ isOpen, onClose, onCreateRoom, nickname, initialSpeed, initialRounds, title = "Create Room", buttonText = "Start" }) {
  const [speed, setSpeed] = useState(initialSpeed || 5);
  const [rounds, setRounds] = useState(initialRounds || 3);
  const [isCreating, setIsCreating] = useState(false);
  const codeDisplayRef = useRef(null);

  // Update state when initial values change
  useEffect(() => {
    if (initialSpeed !== undefined) setSpeed(initialSpeed);
    if (initialRounds !== undefined) setRounds(initialRounds);
  }, [initialSpeed, initialRounds]);

  const handleStart = async () => {
    setIsCreating(true);
    try {
      const settings = { speed: parseInt(speed), rounds: parseInt(rounds) };
      await onCreateRoom(settings);
      // Modal will close and navigation happens via App.js
      handleClose();
    } catch (error) {
      console.error('Error creating room:', error);
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setSpeed(initialSpeed || 5);
    setRounds(initialRounds || 3);
    setIsCreating(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <div className="create-room-modal-content">
        <div className="room-settings">
          <p className="settings-intro">Configure your game settings</p>
          
          <div className="setting-group">
            <label htmlFor="speed" className="setting-label">
              Game Speed: <span className="setting-value">{speed}</span>
            </label>
            <input
              id="speed"
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
              className="setting-slider"
            />
            <div className="setting-range">
              <span>Slow</span>
              <span>Fast</span>
            </div>
          </div>

          <div className="setting-group">
            <label htmlFor="rounds" className="setting-label">
              Number of Rounds: <span className="setting-value">{rounds}</span>
            </label>
            <input
              id="rounds"
              type="number"
              min="1"
              max="10"
              value={rounds}
              onChange={(e) => setRounds(e.target.value)}
              className="setting-input"
            />
          </div>
        </div>

        <div className="modal-button-group">
          <Button
            onClick={handleStart}
            disabled={isCreating || speed < 1 || speed > 10 || rounds < 1 || rounds > 10}
            variant="primary"
            className="start-room-btn"
          >
            {isCreating ? 'Saving...' : buttonText}
          </Button>
          <Button
            onClick={handleClose}
            variant="secondary"
            className="cancel-btn"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default CreateRoomModal;
