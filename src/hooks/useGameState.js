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

  const createRoom = () => {
    // Generate a random room code (6 characters)
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);
    setPlayers([{ username, id: Date.now() }]);
    setGameStatus('waiting');
    setScores({});
    return code;
  };

  const joinRoom = (code) => {
    setRoomCode(code.toUpperCase());
    // TODO: Add player to room via Firebase
    setGameStatus('waiting');
    setScores({});
  };

  const leaveRoom = () => {
    setRoomCode('');
    setPlayers([]);
    setGameStatus('idle');
    setScores({});
    // TODO: Remove player from room via Firebase
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
    createRoom,
    joinRoom,
    leaveRoom,
  };
}

export default useGameState;
