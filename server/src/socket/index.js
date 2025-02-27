import handleChat from './chatHandler.js';
import { SOCKET_EVENTS } from '../../../core/src/constants/events.js';
import { AIService } from '../services/aiService.js';

const setupSocket = (io) => {
  const ai = new AIService();
  // Track active clients and their states
  const clients = new Map();

  io.on('connection', (socket) => {
    console.log('[Socket] Client connected:', socket.id);

    // Store client info
    clients.set(socket.id, {
      connected: Date.now(),
      engineState: null
    });

    // Send welcome message
    socket.emit(SOCKET_EVENTS.CHAT.WELCOME, { 
      message: 'Welcome to Serra!' 
    });

    // Handle engine state updates from client
    socket.on(SOCKET_EVENTS.ENGINE.STATE, (state) => {
      const client = clients.get(socket.id);
      if (client) {
        client.engineState = state;
      }
    });

    // Handle chat messages with AI service
    socket.on(SOCKET_EVENTS.CHAT.MESSAGE, async (msg) => {
      console.log('[Chat] Message received:', msg);
      
      try {
        const response = await ai.processMessage(msg.text, socket);
        socket.emit(SOCKET_EVENTS.CHAT.RESPONSE, {
          text: response,
          type: 'ai'
        });
      } catch (error) {
        console.error('[Chat] Error processing message:', error);
        socket.emit(SOCKET_EVENTS.CHAT.RESPONSE, {
          text: 'Thinking...',
          type: 'ai'
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Client disconnected:', socket.id);
      clients.delete(socket.id);
    });
  });
};

export default setupSocket;
