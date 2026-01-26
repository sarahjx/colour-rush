import { useState } from 'react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import './WaitingRoom.css';

function WaitingRoom({ roomCode, players = [], isHost = false, onStartGame, onLeaveRoom, onBackToHome }) {
  const [copied, setCopied] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="waiting-room">
      <Button
        variant="secondary"
        className="info-button"
        onClick={() => setIsHowToPlayOpen(true)}
      >
        How to Play
      </Button>

      <div className="room-code-corner">
        <span className="room-code-label-small">Room</span>
        <span className="room-code-small">{roomCode}</span>
        <Button
          variant="secondary"
          className="copy-room-code-btn"
          onClick={handleCopy}
        >
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>

      <div className="waiting-room-content">
        <h1 className="waiting-room-title">Waiting Room</h1>

        <div className="players-container">
          <h2 className="players-title">Players ({players.length})</h2>
          <div className="players-list">
            {players.length === 0 ? (
              <p className="no-players">No players yet</p>
            ) : (
              players.map((player) => (
                <div key={player.id} className="player-card">
                  <div 
                    className="player-colour-indicator"
                    style={{ backgroundColor: player.nicknameColour || '#ef4444' }}
                  />
                  <span 
                    className="player-nickname"
                    style={{ color: player.nicknameColour || '#ef4444' }}
                  >
                    {player.nickname}
                  </span>
                  {player.isHost && (
                    <span className="host-badge">Host</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="waiting-room-actions">
          {isHost ? (
            <>
              <Button
                variant="primary"
                className="start-game-btn-large"
                onClick={onStartGame}
              >
                Start Game
              </Button>
              <Button
                variant="secondary"
                className="back-to-home-btn"
                onClick={onBackToHome}
              >
                Back to Home
              </Button>
            </>
          ) : (
            <>
              <div className="waiting-message">
                <p className="waiting-text">Waiting for Host</p>
              </div>
              <Button
                variant="secondary"
                className="back-to-home-btn"
                onClick={onBackToHome}
              >
                Back to Home
              </Button>
            </>
          )}
        </div>
      </div>

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

export default WaitingRoom;
