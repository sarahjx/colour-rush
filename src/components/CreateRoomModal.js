import { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import './CreateRoomModal.css';

function CreateRoomModal({ isOpen, onClose, onCreateRoom, nickname, initialDifficulty, initialRounds, title = "Create Room", buttonText = "Start" }) {
  const [difficulty, setDifficulty] = useState(initialDifficulty || 'normal');
  const [rounds, setRounds] = useState(initialRounds || 3);
  const [isCreating, setIsCreating] = useState(false);

  // Update state when initial values change
  useEffect(() => {
    if (initialDifficulty !== undefined) setDifficulty(initialDifficulty);
    if (initialRounds !== undefined) setRounds(initialRounds);
  }, [initialDifficulty, initialRounds]);

  const handleStart = async () => {
    setIsCreating(true);
    try {
      const settings = { difficulty, rounds: parseInt(rounds) };
      await onCreateRoom(settings);
      // Modal will close and navigation happens via App.js
      handleClose();
    } catch (error) {
      console.error('Error creating room:', error);
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setDifficulty(initialDifficulty || 'normal');
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
            <label htmlFor="difficulty" className="setting-label">
              Difficulty Level
            </label>
            <div className="difficulty-buttons">
              <button
                type="button"
                className={`difficulty-btn ${difficulty === 'easy' ? 'active' : ''}`}
                onClick={() => setDifficulty('easy')}
              >
                Easy
              </button>
              <button
                type="button"
                className={`difficulty-btn ${difficulty === 'normal' ? 'active' : ''}`}
                onClick={() => setDifficulty('normal')}
              >
                Normal
              </button>
              <button
                type="button"
                className={`difficulty-btn ${difficulty === 'difficult' ? 'active' : ''}`}
                onClick={() => setDifficulty('difficult')}
              >
                Difficult
              </button>
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
            disabled={isCreating || !difficulty || rounds < 1 || rounds > 10}
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
