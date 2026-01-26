import useGameState from './hooks/useGameState';
import Landing from './pages/Landing';
import Room from './pages/Room';
import WaitingRoom from './pages/WaitingRoom';
import Button from './components/Button';
import './App.css';

function App() {
  const gameState = useGameState();
  const { gameStatus, roomCode, players, nickname, leaveRoom } = gameState;
  
  // Determine if current user is host
  const isHost = players.some(player => player.isHost && player.nickname === nickname);

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
      {gameStatus === 'waiting' ? (
        <WaitingRoom
          roomCode={roomCode}
          players={players}
          isHost={isHost}
          onStartGame={handleStartGame}
          onLeaveRoom={handleLeaveRoom}
          onBackToHome={handleBackToMenu}
        />
      ) : gameStatus === 'playing' ? (
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
