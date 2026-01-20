import { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import Modal from './Modal';
import Button from './Button';
import './CreateRoomModal.css';

function CreateRoomModal({ isOpen, onClose, onCreateRoom, username }) {
  const [isCreating, setIsCreating] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [copied, setCopied] = useState(false);
  const codeDisplayRef = useRef(null);

  useEffect(() => {
    if (roomCode && codeDisplayRef.current) {
      gsap.fromTo(
        codeDisplayRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
      );
    }
  }, [roomCode]);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const code = await onCreateRoom();
      setRoomCode(code);
    } catch (error) {
      console.error('Error creating room:', error);
      setIsCreating(false);
    }
  };

  const handleCopy = async () => {
    if (roomCode) {
      try {
        await navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleClose = () => {
    setRoomCode('');
    setIsCreating(false);
    setCopied(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Room">
      <div className="create-room-modal-content">
        {!roomCode ? (
          <>
            <div className="creating-room-message">
              <p>Ready to create a room for <strong>{username}</strong>?</p>
              <p className="sub-message">Share the room code with friends to play together!</p>
            </div>
            <div className="modal-button-group">
              <Button
                onClick={handleCreate}
                disabled={isCreating}
                variant="primary"
                className="create-room-confirm-btn"
              >
                {isCreating ? 'Creating...' : 'Create Room'}
              </Button>
              <Button
                onClick={handleClose}
                variant="secondary"
                className="cancel-btn"
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="room-created-content">
              <p className="success-message">Room created successfully!</p>
              <div className="room-code-section">
                <label className="room-code-label">Room Code</label>
                <div ref={codeDisplayRef} className="room-code-display-modal">
                  {roomCode}
                </div>
                <Button
                  onClick={handleCopy}
                  variant="primary"
                  className="copy-code-btn"
                >
                  {copied ? 'Copied!' : 'Copy Code'}
                </Button>
              </div>
              <p className="share-message">Share this code with friends to join your room!</p>
            </div>
            <div className="modal-button-group">
              <Button
                onClick={() => {
                  handleClose();
                  // Navigation will happen automatically via App.js when gameStatus is 'waiting'
                }}
                variant="primary"
                className="continue-btn"
              >
                Continue to Room
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export default CreateRoomModal;
