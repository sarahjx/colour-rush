import { useState } from 'react';
import { generateUniqueRoomCode } from '../utils/roomCodeGenerator';

function useGameState() {
  // Game state
  const [nickname, setNickname] = useState('');
  const [nicknameColor, setNicknameColor] = useState('#6366f1'); // Default primary color
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [gameStatus, setGameStatus] = useState('idle'); // idle, waiting, playing, finished
  const [scores, setScores] = useState({});
  const [gameSettings, setGameSettings] = useState({
    speed: 5, // Default speed (1-10)
    rounds: 3 // Default number of rounds
  });

  // Functions
  const handleSetNickname = (name) => {
    setNickname(name);
  };

  const handleSetNicknameColor = (color) => {
    setNicknameColor(color);
  };

  const createRoom = async (settings = null) => {
    // Generate a unique room code
    const code = await generateUniqueRoomCode();
    setRoomCode(code);
    if (settings) {
      setGameSettings(settings);
    }
    setPlayers([{ nickname, nicknameColor, id: Date.now(), isHost: true }]);
    setGameStatus('waiting');
    setScores({});
    return code;
  };

  const joinRoom = (code) => {
    setRoomCode(code.toUpperCase());
    // TODO: Add player to room via Firebase
    // For now, add current player to players list
    setPlayers(prev => [...prev, { nickname, nicknameColor, id: Date.now(), isHost: false }]);
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
    nickname,
    nicknameColor,
    roomCode,
    players,
    gameStatus,
    scores,
    gameSettings,
    // Functions
    setNickname: handleSetNickname,
    setNicknameColor: handleSetNicknameColor,
    setGameSettings,
    createRoom,
    joinRoom,
    leaveRoom,
  };
}

export default useGameState;
