import { useState } from 'react';
import Button from '../components/Button';
import './WaitingRoom.css';

function WaitingRoom({ roomCode, players = [], isHost = false, onStartGame, onLeaveRoom }) {
  const [copied, setCopied] = useState(false);

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
            <Button
              variant="primary"
              className="start-game-btn-large"
              onClick={onStartGame}
            >
              Start Game
            </Button>
          ) : (
            <div className="waiting-message">
              <p className="waiting-text">Waiting for Host</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WaitingRoom;
