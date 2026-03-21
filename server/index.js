const { createServer } = require('http');
const { Server } = require('socket.io');

const PORT = Number(process.env.PORT || 4000);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

const rooms = new Map();

function sanitizeSettings(settings = {}) {
  const difficulty = ['easy', 'normal', 'difficult'].includes(settings.difficulty)
    ? settings.difficulty
    : 'normal';
  const parsedRounds = Number(settings.rounds);
  const rounds = Number.isFinite(parsedRounds)
    ? Math.min(10, Math.max(1, parsedRounds))
    : 3;

  return { difficulty, rounds };
}

function serializeRoom(room) {
  return {
    roomCode: room.roomCode,
    gameStatus: room.gameStatus,
    isPaused: Boolean(room.isPaused),
    gameSettings: room.gameSettings,
    players: room.players,
    scores: room.scores,
  };
}

function emitRoomState(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return;
  io.to(roomCode).emit('room_state', serializeRoom(room));
}

function createRoomState({ roomCode, hostPlayer, settings }) {
  return {
    roomCode,
    gameStatus: 'waiting',
    isPaused: false,
    gameSettings: sanitizeSettings(settings),
    players: [{ ...hostPlayer, isHost: true }],
    scores: {},
  };
}

function removePlayerFromRoom(roomCode, playerId) {
  const room = rooms.get(roomCode);
  if (!room) return;

  room.players = room.players.filter((player) => player.id !== playerId);
  delete room.scores[playerId];

  if (room.players.length === 0) {
    rooms.delete(roomCode);
    return;
  }

  if (!room.players.some((player) => player.isHost)) {
    room.players[0].isHost = true;
  }

  emitRoomState(roomCode);
}

io.on('connection', (socket) => {
  socket.on('create_room', ({ roomCode, player, settings }, ack = () => {}) => {
    const normalizedCode = (roomCode || '').toUpperCase();
    if (!normalizedCode) {
      ack({ ok: false, error: 'Invalid room code.' });
      return;
    }
    if (rooms.has(normalizedCode)) {
      ack({ ok: false, error: 'Room already exists.' });
      return;
    }
    if (!player?.id || !player?.nickname) {
      ack({ ok: false, error: 'Invalid player details.' });
      return;
    }

    const room = createRoomState({
      roomCode: normalizedCode,
      hostPlayer: player,
      settings,
    });
    rooms.set(normalizedCode, room);

    socket.join(normalizedCode);
    socket.data.playerId = player.id;
    socket.data.roomCode = normalizedCode;

    ack({ ok: true, room: serializeRoom(room) });
    emitRoomState(normalizedCode);
  });

  socket.on('join_room', ({ roomCode, player }, ack = () => {}) => {
    const normalizedCode = (roomCode || '').toUpperCase();
    const room = rooms.get(normalizedCode);
    if (!room) {
      ack({ ok: false, error: 'Room not found.' });
      return;
    }
    if (!player?.id || !player?.nickname) {
      ack({ ok: false, error: 'Invalid player details.' });
      return;
    }
    if (room.gameStatus !== 'waiting') {
      ack({ ok: false, error: 'Game already started.' });
      return;
    }
    if (room.players.some((roomPlayer) => roomPlayer.id === player.id)) {
      ack({ ok: false, error: 'Player already joined this room.' });
      return;
    }

    room.players.push({ ...player, isHost: false });

    socket.join(normalizedCode);
    socket.data.playerId = player.id;
    socket.data.roomCode = normalizedCode;

    ack({ ok: true, room: serializeRoom(room) });
    emitRoomState(normalizedCode);
  });

  socket.on('update_settings', ({ roomCode, playerId, settings }, ack = () => {}) => {
    const normalizedCode = (roomCode || '').toUpperCase();
    const room = rooms.get(normalizedCode);
    if (!room) {
      ack({ ok: false, error: 'Room not found.' });
      return;
    }
    const host = room.players.find((player) => player.isHost);
    if (!host || host.id !== playerId) {
      ack({ ok: false, error: 'Only the host can update settings.' });
      return;
    }

    room.gameSettings = sanitizeSettings(settings);
    ack({ ok: true });
    emitRoomState(normalizedCode);
  });

  socket.on('start_game', ({ roomCode, playerId }, ack = () => {}) => {
    const normalizedCode = (roomCode || '').toUpperCase();
    const room = rooms.get(normalizedCode);
    if (!room) {
      ack({ ok: false, error: 'Room not found.' });
      return;
    }
    const host = room.players.find((player) => player.isHost);
    if (!host || host.id !== playerId) {
      ack({ ok: false, error: 'Only the host can start the game.' });
      return;
    }

    room.gameStatus = 'countdown';
    room.isPaused = false;
    room.scores = {};
    ack({ ok: true });
    emitRoomState(normalizedCode);
  });

  socket.on('toggle_pause', ({ roomCode, playerId, paused }, ack = () => {}) => {
    const normalizedCode = (roomCode || '').toUpperCase();
    const room = rooms.get(normalizedCode);
    if (!room) {
      ack({ ok: false, error: 'Room not found.' });
      return;
    }
    const host = room.players.find((player) => player.isHost);
    if (!host || host.id !== playerId) {
      ack({ ok: false, error: 'Only the host can pause the game.' });
      return;
    }
    if (room.gameStatus !== 'playing') {
      ack({ ok: false, error: 'Game is not currently running.' });
      return;
    }

    room.isPaused = Boolean(paused);
    ack({ ok: true });
    emitRoomState(normalizedCode);
  });

  socket.on('set_game_status', ({ roomCode, status }, ack = () => {}) => {
    const normalizedCode = (roomCode || '').toUpperCase();
    const room = rooms.get(normalizedCode);
    if (!room) {
      ack({ ok: false, error: 'Room not found.' });
      return;
    }

    room.gameStatus = status;
    ack({ ok: true });
    emitRoomState(normalizedCode);
  });

  socket.on('submit_score', ({ roomCode, playerId, score }, ack = () => {}) => {
    const normalizedCode = (roomCode || '').toUpperCase();
    const room = rooms.get(normalizedCode);
    if (!room) {
      ack({ ok: false, error: 'Room not found.' });
      return;
    }

    const player = room.players.find((entry) => entry.id === playerId);
    if (!player) {
      ack({ ok: false, error: 'Player not in room.' });
      return;
    }

    room.scores[playerId] = {
      nickname: player.nickname,
      nicknameColour: player.nicknameColour,
      totalScore: Number(score?.totalScore || 0),
    };
    room.gameStatus = 'finished';
    room.isPaused = false;

    ack({ ok: true });
    emitRoomState(normalizedCode);
  });

  socket.on('return_to_waiting', ({ roomCode, playerId }, ack = () => {}) => {
    const normalizedCode = (roomCode || '').toUpperCase();
    const room = rooms.get(normalizedCode);
    if (!room) {
      ack({ ok: false, error: 'Room not found.' });
      return;
    }
    const host = room.players.find((player) => player.isHost);
    if (!host || host.id !== playerId) {
      ack({ ok: false, error: 'Only the host can reset the room.' });
      return;
    }

    room.gameStatus = 'waiting';
    room.isPaused = false;
    room.scores = {};
    ack({ ok: true });
    emitRoomState(normalizedCode);
  });

  socket.on('leave_room', ({ roomCode, playerId }, ack = () => {}) => {
    const normalizedCode = (roomCode || '').toUpperCase();
    removePlayerFromRoom(normalizedCode, playerId);
    socket.leave(normalizedCode);
    ack({ ok: true });
  });

  socket.on('disconnect', () => {
    if (socket.data.roomCode && socket.data.playerId) {
      removePlayerFromRoom(socket.data.roomCode, socket.data.playerId);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket server listening on port ${PORT}`);
});
