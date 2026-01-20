import { useState } from 'react';

function useGameState() {
  // Game state
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [gameStatus, setGameStatus] = useState('idle'); // idle, waiting, playing, finished
  const [scores, setScores] = useState({});

  // Functions
  const handleSetUsername = (name) => {
    setUsername(name);
  };

  return {
    // State
    username,
    roomCode,
    players,
    gameStatus,
    scores,
    // Functions
    setUsername: handleSetUsername,
  };
}
