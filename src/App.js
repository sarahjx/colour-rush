import useGameState from './hooks/useGameState';
import Landing from './pages/Landing';
import Room from './pages/Room';
import './App.css';

function App() {
  const gameState = useGameState();
  const { gameStatus, roomCode, players, leaveRoom } = gameState;

  const handleStartGame = () => {
    // TODO: Implement start game functionality
    console.log('Starting game...');
  };

  const handleLeaveRoom = () => {
    leaveRoom();
  };

  const handleBackToMenu = () => {
    leaveRoom();
  };

  return (
    <div className="App">
      {gameStatus === 'waiting' || gameStatus === 'playing' ? (
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
