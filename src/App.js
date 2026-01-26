import useGameState from './hooks/useGameState';
import Landing from './pages/Landing';
import Room from './pages/Room';
import WaitingRoom from './pages/WaitingRoom';
import Countdown from './pages/Countdown';
import Game from './pages/Game';
import Button from './components/Button';
import './App.css';

function App() {
  const gameState = useGameState();
  const { gameStatus, roomCode, players, nickname, gameSettings, leaveRoom, startGame, beginPlaying, endGame } = gameState;
  
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
          onStartGame={handleStartGame}
          onLeaveRoom={handleLeaveRoom}
          onBackToHome={handleBackToMenu}
        />
      ) : gameStatus === 'countdown' ? (
        <Countdown onComplete={beginPlaying} />
      ) : gameStatus === 'playing' ? (
        <Game 
          gameSettings={gameSettings}
          onGameEnd={endGame}
        />
      ) : gameStatus === 'finished' ? (
        <Room
          roomCode={roomCode}
          players={players}
          onStartGame={handleStartGame}
          onLeaveRoom={handleLeaveRoom}
          onBackToMenu={handleBackToMenu}
        />
      ) : (
        <Landing gameState={gameState} />
      )}
    </div>
  );
}

export default App;
