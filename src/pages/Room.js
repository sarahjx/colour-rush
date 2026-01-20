import { useState } from 'react';
import './Room.css';

function Room({ roomCode, players = [] }) {
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
    <div className="room">
      <div className="room-container">
        <div className="room-content">
          <h2 className="room-title">Room Code</h2>
          <div className="room-code-display">
            {roomCode}
          </div>
          <button className="btn btn-copy" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>

          <div className="player-list-section">
            <h3 className="player-list-title">Players</h3>
            <div className="player-list">
              {players.length === 0 ? (
                <p className="player-list-empty">No players yet</p>
              ) : (
                players.map((player) => (
                  <div key={player.id} className="player-item">
                    {player.username}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Room;
