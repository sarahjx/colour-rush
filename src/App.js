import useGameState from './hooks/useGameState';
import Landing from './pages/Landing';
import WaitingRoom from './pages/WaitingRoom';
import Countdown from './pages/Countdown';
import Game from './pages/Game';
import EndGame from './pages/EndGame';
import './App.css';

function App() {
  const gameState = useGameState();
  const { gameStatus, roomCode, players, nickname, gameSettings, playerScores, leaveRoom, returnToWaitingRoom, startGame, beginPlaying, endGame } = gameState;
  
  // Determine if current user is host
  const isHost = players.some(player => player.isHost && player.nickname === nickname);

  const handleStartGame = () => {
    startGame();
  };

  const handleLeaveRoom = () => {
    leaveRoom();
  };

  const handleBackToMenu = () => {
    leaveRoom();
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
        <Countdown onComplete={beginPlaying} />
      ) : gameStatus === 'playing' ? (
        <Game 
          gameSettings={gameSettings}
          players={players}
          onRoundEnd={endGame}
          onGameEnd={endGame}
          onLeaveRoom={handleLeaveRoom}
        />
      ) : gameStatus === 'finished' ? (
        <EndGame
          roomCode={roomCode}
          players={players}
          playerScores={playerScores}
          onPlayAgain={() => returnToWaitingRoom()}
          onLeaveRoom={handleLeaveRoom}
        />
      ) : (
        <Landing gameState={gameState} />
      )}
    </div>
  );
}

export default App;
