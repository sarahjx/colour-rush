import { useCallback, useEffect, useRef, useState } from 'react';
import { generateUniqueRoomCode } from '../utils/roomCodeGenerator';
import { connectSocket, emitWithAck } from '../services/socketClient';

const STORAGE_KEYS = {
  nickname: 'colorRush_nickname',
  colour: 'colorRush_nicknameColour',
  playerId: 'colorRush_playerId',
};

function createPlayerId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `player_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function useGameState() {
  // Load from local storage on mount.
  const loadFromStorage = () => {
    try {
      const savedNickname = localStorage.getItem(STORAGE_KEYS.nickname);
      const savedColour = localStorage.getItem(STORAGE_KEYS.colour);
      const savedPlayerId = localStorage.getItem(STORAGE_KEYS.playerId) || createPlayerId();

      localStorage.setItem(STORAGE_KEYS.playerId, savedPlayerId);
      return {
        nickname: savedNickname || '',
        colour: savedColour || '#ef4444',
        playerId: savedPlayerId,
      };
    } catch (error) {
      console.error('Error loading from local storage:', error);
      return { nickname: '', colour: '#ef4444', playerId: createPlayerId() };
    }
  };

  const savedData = loadFromStorage();

  // Game state
  const [nickname, setNickname] = useState(savedData.nickname);
  const [nicknameColour, setNicknameColour] = useState(savedData.colour);
  const [playerId] = useState(savedData.playerId);
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [gameStatus, setGameStatus] = useState('idle'); // idle, waiting, countdown, playing, finished
  const [isPaused, setIsPaused] = useState(false);
  const [scores, setScores] = useState({});
  const [playerScores, setPlayerScores] = useState({}); // Final player scores from game
  const [gameSettings, setGameSettings] = useState({
    difficulty: 'normal', // easy, normal, difficult
    rounds: 3 // Default number of rounds
  });
  const playerIdRef = useRef(savedData.playerId);
  const roomSyncIntervalRef = useRef(null);

  // Save profile fields to local storage.
  const saveToStorage = (name, colour) => {
    try {
      if (name) localStorage.setItem(STORAGE_KEYS.nickname, name);
      if (colour) localStorage.setItem(STORAGE_KEYS.colour, colour);
    } catch (error) {
      console.error('Error saving to local storage:', error);
    }
  };

  const applyRoomState = useCallback((room) => {
    if (!room) return;
    setRoomCode(room.roomCode || '');
    setPlayers(room.players || []);
    setGameSettings(room.gameSettings || { difficulty: 'normal', rounds: 3 });
    setGameStatus(room.gameStatus || 'idle');
    setIsPaused(Boolean(room.isPaused));
    setPlayerScores(room.scores || {});
  }, []);

  const syncRoomState = useCallback(async (codeToSync = roomCode) => {
    if (!codeToSync) return;

    try {
      const response = await emitWithAck('get_room_state', {
        roomCode: codeToSync,
      });
      if (response?.ok && response.room) {
        applyRoomState(response.room);
      }
    } catch (error) {
      // Keep polling soft-failure only; realtime events may still arrive.
      console.debug('Room sync skipped:', error.message);
    }
  }, [applyRoomState, roomCode]);

  useEffect(() => {
    const socket = connectSocket();

    const handleRoomState = (room) => {
      applyRoomState(room);
    };

    socket.on('room_state', handleRoomState);
    return () => {
      socket.off('room_state', handleRoomState);
    };
  }, [applyRoomState]);

  const currentPlayer = () => ({
    id: playerIdRef.current,
    nickname: nickname.trim(),
    nicknameColour,
  });

  // Functions.
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
    const player = currentPlayer();
    if (!player.nickname) {
      throw new Error('Nickname is required.');
    }

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const code = await generateUniqueRoomCode();
      const response = await emitWithAck('create_room', {
        roomCode: code,
        player,
        settings,
      });

      if (response?.ok) {
        applyRoomState(response.room);
        await syncRoomState(response.room?.roomCode || code);
        setScores({});
        return code;
      }

      if (response?.error !== 'Room already exists.') {
        throw new Error(response?.error || 'Unable to create room.');
      }
    }

    throw new Error('Unable to create a unique room. Please try again.');
  };

  const joinRoom = async (code) => {
    const player = currentPlayer();
    if (!player.nickname) {
      throw new Error('Nickname is required.');
    }

    const response = await emitWithAck('join_room', {
      roomCode: code.toUpperCase(),
      player,
    });

    if (!response?.ok) {
      throw new Error(response?.error || 'Unable to join room.');
    }

    applyRoomState(response.room);
    await syncRoomState(response.room?.roomCode || code.toUpperCase());
    setScores({});
  };

  const leaveRoom = async () => {
    if (roomCode) {
      try {
        await emitWithAck('leave_room', {
          roomCode,
          playerId: playerIdRef.current,
        });
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    }

    setRoomCode('');
    setPlayers([]);
    setGameStatus('idle');
    setIsPaused(false);
    setScores({});
    setPlayerScores({});
  };

  const returnToWaitingRoom = async () => {
    if (!roomCode) {
      setGameStatus('waiting');
      setPlayerScores({});
      return;
    }

    const response = await emitWithAck('return_to_waiting', {
      roomCode,
      playerId: playerIdRef.current,
    });

    if (!response?.ok) {
      throw new Error(response?.error || 'Unable to reset room.');
    }
  };

  const startGame = async () => {
    const response = await emitWithAck('start_game', {
      roomCode,
      playerId: playerIdRef.current,
    });

    if (!response?.ok) {
      throw new Error(response?.error || 'Unable to start game.');
    }
  };

  const beginPlaying = async () => {
    const response = await emitWithAck('set_game_status', {
      roomCode,
      status: 'playing',
    });

    if (!response?.ok) {
      throw new Error(response?.error || 'Unable to begin game.');
    }
  };

  const endGame = async (finalScores) => {
    let totalScore = 0;
    if (typeof finalScores === 'number') {
      totalScore = finalScores;
    } else if (finalScores && typeof finalScores.totalScore === 'number') {
      totalScore = finalScores.totalScore;
    }

    setPlayerScores((prev) => ({
      ...prev,
      [playerIdRef.current]: {
        nickname,
        nicknameColour,
        totalScore,
      },
    }));
    setScores((prev) => ({ ...prev, [nickname]: totalScore }));

    if (!roomCode) {
      setGameStatus('finished');
      return;
    }

    const response = await emitWithAck('submit_score', {
      roomCode,
      playerId: playerIdRef.current,
      score: { totalScore },
    });

    if (!response?.ok) {
      throw new Error(response?.error || 'Unable to submit score.');
    }

    return response;
  };

  const togglePauseGame = async (paused) => {
    const response = await emitWithAck('toggle_pause', {
      roomCode,
      playerId: playerIdRef.current,
      paused,
    });

    if (!response?.ok) {
      throw new Error(response?.error || 'Unable to pause game.');
    }
  };

  useEffect(() => {
    if (!playerScores[playerIdRef.current]) {
      return;
    }

    setScores((prev) => ({
      ...prev,
      [nickname]: playerScores[playerIdRef.current].totalScore || 0,
    }));
  }, [nickname, playerScores]);

  useEffect(() => {
    playerIdRef.current = playerId;
  }, [playerId]);

  useEffect(() => {
    if (!roomCode) {
      if (roomSyncIntervalRef.current) {
        clearInterval(roomSyncIntervalRef.current);
        roomSyncIntervalRef.current = null;
      }
      return;
    }

    // Snapshot sync avoids stale player lists if a socket event is missed.
    syncRoomState(roomCode);
    roomSyncIntervalRef.current = setInterval(() => {
      syncRoomState(roomCode);
    }, 1500);

    return () => {
      if (roomSyncIntervalRef.current) {
        clearInterval(roomSyncIntervalRef.current);
        roomSyncIntervalRef.current = null;
      }
    };
  }, [roomCode, syncRoomState]);

  return {
    // State.
    nickname,
    nicknameColour,
    playerId,
    roomCode,
    players,
    gameStatus,
    isPaused,
    scores,
    playerScores,
    gameSettings,
    // Functions.
    setNickname: handleSetNickname,
    setNicknameColour: handleSetNicknameColour,
    saveNicknameAndColour,
    setGameSettings: async (settings) => {
      if (!roomCode) {
        setGameSettings(settings);
        return;
      }

      const response = await emitWithAck('update_settings', {
        roomCode,
        playerId: playerIdRef.current,
        settings,
      });

      if (!response?.ok) {
        throw new Error(response?.error || 'Unable to update settings.');
      }
    },
    createRoom,
    joinRoom,
    leaveRoom,
    returnToWaitingRoom,
    startGame,
    beginPlaying,
    togglePauseGame,
    endGame,
  };
}

export default useGameState;
