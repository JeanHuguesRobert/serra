import { Server } from 'socket.io';
import { io } from 'socket.io-client';

/**
 * Creates client socket instance
 */
const createClient = (url = 'http://localhost:3000') => {
  console.log('[Socket] Creating client socket');
  return io(url, {
    reconnection: false
  });
};

/**
 * Creates server socket instance
 */
const createServer = (httpServer) => {
  console.log('[Socket] Creating server socket');
  return new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });
};

export const createClientSocket = createClient;
export const createServerSocket = createServer;