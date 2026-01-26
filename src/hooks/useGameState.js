import { useState, useEffect } from 'react';
import { generateUniqueRoomCode } from '../utils/roomCodeGenerator';

function useGameState() {
  // Load from local storage on mount
  const loadFromStorage = () => {
    try {
      const savedNickname = localStorage.getItem('colorRush_nickname');
      const savedColour = localStorage.getItem('colorRush_nicknameColour');
      return {
        nickname: savedNickname || '',
        colour: savedColour || '#ef4444'
      };
    } catch (error) {
      console.error('Error loading from local storage:', error);
      return { nickname: '', colour: '#ef4444' };
    }
  };

  const savedData = loadFromStorage();

  // Game state
  const [nickname, setNickname] = useState(savedData.nickname);
  const [nicknameColour, setNicknameColour] = useState(savedData.colour);
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [gameStatus, setGameStatus] = useState('idle'); // idle, waiting, countdown, playing, finished
  const [scores, setScores] = useState({});
  const [playerScores, setPlayerScores] = useState({}); // Final player scores from game
  const [gameSettings, setGameSettings] = useState({
    speed: 5, // Default speed (1-10)
    rounds: 3 // Default number of rounds
  });

  // Save to local storage
  const saveToStorage = (name, colour) => {
    try {
      if (name) localStorage.setItem('colorRush_nickname', name);
      if (colour) localStorage.setItem('colorRush_nicknameColour', colour);
    } catch (error) {
      console.error('Error saving to local storage:', error);
    }
  };

  // Functions
  const handleSetNickname = (name) => {
    setNickname(name);
  };

  const handleSetNicknameColour = (colour) => {
    setNicknameColour(colour);
  };

  const saveNicknameAndColour = () => {
    saveToStorage(nickname, nicknameColour);
  };

  const createRoom = async (settings = null) => {
    // Generate a unique room code
    const code = await generateUniqueRoomCode();
    setRoomCode(code);
    if (settings) {
      setGameSettings(settings);
    }
    setPlayers([{ nickname, nicknameColour, id: Date.now(), isHost: true }]);
    setGameStatus('waiting');
    setScores({});
    return code;
  };

  const joinRoom = (code) => {
    setRoomCode(code.toUpperCase());
    // TODO: Add player to room via Firebase
    // For now, add current player to players list
    setPlayers(prev => [...prev, { nickname, nicknameColour, id: Date.now(), isHost: false }]);
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

  const startGame = () => {
    setGameStatus('countdown');
  };

  const beginPlaying = () => {
    setGameStatus('playing');
  };

  const endGame = (finalScores) => {
    // finalScores can be either a number (old format) or an object with player scores
    if (typeof finalScores === 'object' && finalScores !== null) {
      setPlayerScores(finalScores);
      // Also update scores for backward compatibility
      if (finalScores[nickname]) {
        setScores(prev => ({ ...prev, [nickname]: finalScores[nickname].totalScore || 0 }));
      }
    } else {
      // Old format - just a number
      setScores(prev => ({ ...prev, [nickname]: finalScores }));
    }
    setGameStatus('finished');
  };

  return {
    // State
    nickname,
    nicknameColour,
    roomCode,
    players,
    gameStatus,
    scores,
    playerScores,
    gameSettings,
    // Functions
    setNickname: handleSetNickname,
    setNicknameColour: handleSetNicknameColour,
    saveNicknameAndColour,
    setGameSettings,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    beginPlaying,
    endGame,
  };
}

export default useGameState;
