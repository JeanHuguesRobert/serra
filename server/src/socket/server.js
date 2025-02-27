import { Server } from 'socket.io';
import { SOCKET_EVENTS } from '../../../core/src/constants/events.js';

export const setupSocketServer = (server) => {
  console.log('[Socket] Setting up server socket');
  
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Single client state
  let activeClientId = null;
  let engineState = null;

  io.on('connection', (socket) => {
    console.log('[Socket] Client connected:', socket.id);
    activeClientId = socket.id;

    socket.on(SOCKET_EVENTS.ENGINE.STATE, (state) => {
      engineState = state;
    });

    socket.on('disconnect', () => {
      if (socket.id === activeClientId) {
        activeClientId = null;
        engineState = null;
      }
    });
  });

  return io;
};