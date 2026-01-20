import { useState } from 'react';
import { generateUniqueRoomCode } from '../utils/roomCodeGenerator';

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

  const createRoom = async () => {
    // Generate a unique room code
    const code = await generateUniqueRoomCode();
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
