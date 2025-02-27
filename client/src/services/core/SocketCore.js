import { io } from 'socket.io-client';
import { EventEmitter } from 'events';
import { LoggerMixin } from './LoggerMixin';

/**
 * Framework-agnostic core socket service
 */
export class SocketCore extends EventEmitter {
  constructor(config = {}) {
    super();
    Object.assign(this, LoggerMixin('Socket'));
    this.config = config;
    this.connectionAttempts = 0;
    this.debug = true;
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.log('Initializing socket connection...');
        this.socket = io('/', {
          transports: ['websocket'],
          ...this.config
        });

        this.setupEventTracking();
        resolve(this.socket);
      } catch (error) {
        this.error('Connection initialization failed:', error);
        reject(error);
      }
    });
  }

  setupEventTracking() {
    const commonEvents = {
      connect: () => {
        this.log('Connected successfully');
        this.connectionAttempts = 0;
        this.emit('connectionChange', { status: 'connected' });
      },
      disconnect: (reason) => {
        this.warn('Disconnected:', reason);
        this.emit('connectionChange', { status: 'disconnected', error: reason });
      },
      error: (error) => {
        this.error('Socket error:', error);
        this.emit('connectionChange', { status: 'error', error });
      },
      reconnect_attempt: (attempt) => {
        this.connectionAttempts = attempt;
        this.warn(`Reconnection attempt ${attempt}`);
        this.emit('connectionChange', { status: 'connecting' });
      }
    };

    // Attach common event handlers
    Object.entries(commonEvents).forEach(([event, handler]) => {
      this.socket.on(event, handler);
    });

    // Track all events
    this.socket.onAny((eventName, ...args) => {
      this.log('← Received:', eventName, ...args);
    });

    // Override emit for logging
    const originalEmit = this.socket.emit;
    this.socket.emit = (...args) => {
      this.log('→ Emitting:', args[0], ...args.slice(1));
      originalEmit.apply(this.socket, args);
    };
  }

  disconnect() {
    if (this.socket) {
      this.log('Disconnecting socket...');
      this.socket.disconnect();
    }
  }
}