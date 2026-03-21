import useGameState from './hooks/useGameState';
import Landing from './pages/Landing';
import WaitingRoom from './pages/WaitingRoom';
import Countdown from './pages/Countdown';
import Game from './pages/Game';
import EndGame from './pages/EndGame';
import './App.css';

function App() {
  const gameState = useGameState();
  const { gameStatus, roomCode, players, playerId, isPaused, gameSettings, playerScores, leaveRoom, returnToWaitingRoom, startGame, beginPlaying, togglePauseGame, endGame } = gameState;
  
  // Determine if current user is host.
  const isHost = players.some((player) => player.isHost && player.id === playerId);

  const handleStartGame = async () => {
    try {
      await startGame();
    } catch (error) {
      alert(error.message || 'Unable to start game.');
    }
  };

  const handleLeaveRoom = async () => {
    await leaveRoom();
  };

  const handleBackToMenu = async () => {
    await leaveRoom();
  };

  const handleBeginPlaying = async () => {
    try {
      await beginPlaying();
    } catch (error) {
      alert(error.message || 'Unable to begin game.');
    }
  };

  const handleEndGame = async (finalScores) => {
    try {
      await endGame(finalScores);
    } catch (error) {
      alert(error.message || 'Unable to submit score.');
    }
  };

  const handleTogglePause = async (paused) => {
    try {
      await togglePauseGame(paused);
    } catch (error) {
      alert(error.message || 'Unable to pause game.');
    }
  };

  return (
    <div className="App">
      {gameStatus === 'waiting' ? (
        <WaitingRoom
          roomCode={roomCode}
          players={players}
          isHost={isHost}
          gameSettings={gameSettings}
          onStartGame={handleStartGame}
          onLeaveRoom={handleLeaveRoom}
          onBackToHome={handleBackToMenu}
          onUpdateSettings={(settings) => gameState.setGameSettings(settings)}
        />
      ) : gameStatus === 'countdown' ? (
        <Countdown onComplete={handleBeginPlaying} />
      ) : gameStatus === 'playing' ? (
        <Game 
          gameSettings={gameSettings}
          players={players}
          currentPlayerId={playerId}
          isHost={isHost}
          isPaused={isPaused}
          onTogglePause={handleTogglePause}
          onGameEnd={handleEndGame}
        />
      ) : gameStatus === 'finished' ? (
        <EndGame
          roomCode={roomCode}
          players={players}
          playerScores={playerScores}
          onPlayAgain={async () => {
            try {
              await returnToWaitingRoom();
            } catch (error) {
              alert(error.message || 'Only the host can reset the room.');
            }
          }}
          onLeaveRoom={handleLeaveRoom}
        />
      ) : (
        <Landing gameState={gameState} />
      )}
    </div>
  );
}

export default App;
