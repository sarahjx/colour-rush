import { useState } from 'react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import './EndGame.css';

function EndGame({ roomCode, players = [], playerScores = {}, onPlayAgain, onLeaveRoom }) {
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

  // Sort players by score (highest first)
  const sortedPlayers = players.length > 0 
    ? [...players].sort((a, b) => {
        const scoreA = playerScores[a.id]?.totalScore || 0;
        const scoreB = playerScores[b.id]?.totalScore || 0;
        return scoreB - scoreA;
      })
    : [];

  return (
    <div className="end-game">
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

      <div className="end-game-content">
        <h1 className="end-game-title">Game Over!</h1>

        <div className="leaderboard-container">
          <h2 className="leaderboard-title-main">Final Leaderboard</h2>
          <div className="leaderboard-list">
            {sortedPlayers.length === 0 ? (
              <p className="no-scores">No scores yet</p>
            ) : (
              sortedPlayers.map((player, index) => {
                const playerScoreData = playerScores[player.id] || { totalScore: 0 };
                return (
                  <div key={player.id} className="leaderboard-item">
                    <div className="leaderboard-rank">#{index + 1}</div>
                    <div 
                      className="player-colour-indicator"
                      style={{ backgroundColor: player.nicknameColour || '#ef4444' }}
                    />
                    <span 
                      className="leaderboard-nickname"
                      style={{ color: player.nicknameColour || '#ef4444' }}
                    >
                      {player.nickname}
                    </span>
                    {player.isHost && (
                      <span className="host-badge">Host</span>
                    )}
                    <span className="leaderboard-score">
                      {playerScoreData.totalScore || 0}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="end-game-actions">
          <Button
            variant="primary"
            className="play-again-btn-large"
            onClick={onPlayAgain}
          >
            Play Again
          </Button>
          <Button
            variant="secondary"
            className="leave-room-btn-large"
            onClick={onLeaveRoom}
          >
            Leave Room
          </Button>
        </div>
      </div>

      <Modal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
        title="How to Play"
      >
        <div className="how-to-play-content">
          <p className="how-to-play-intro">
            Hue's Right? is a fast-paced brain teaser where you race against time and other players!
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

          <h3>Difficulty Levels</h3>
          <p>The game offers three difficulty levels:</p>
          <ul>
            <li><strong>Easy:</strong> Buttons don't change positions, slower pace that gradually increases each round. Perfect for beginners!</li>
            <li><strong>Normal:</strong> Button colors change positions every 10 seconds, faster pace than Easy, and gets faster each round. A balanced challenge!</li>
            <li><strong>Difficult:</strong> Button colors change positions every 5 seconds, fastest pace, and gets faster each round. For the most skilled players!</li>
          </ul>
        </div>
      </Modal>
    </div>
  );
}

export default EndGame;
