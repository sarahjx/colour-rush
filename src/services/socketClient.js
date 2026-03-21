import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000';

let socketInstance = null;

export function getSocket() {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socketInstance;
}

export function connectSocket() {
  const socket = getSocket();
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
}

export function disconnectSocket() {
  if (socketInstance && socketInstance.connected) {
    socketInstance.disconnect();
  }
}

export async function emitWithAck(eventName, payload, timeout = 5000) {
  const socket = connectSocket();
  return new Promise((resolve, reject) => {
    socket.timeout(timeout).emit(eventName, payload, (error, response) => {
      if (error) {
        reject(new Error('Request timed out.'));
        return;
      }
      resolve(response);
    });
  });
}
