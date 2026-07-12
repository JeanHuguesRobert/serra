import { Transport } from '@serra/core';
import { io } from 'socket.io-client';
import { connectionStatusService } from './ConnectionStatusService.js';
import denbug from '@serra/core/utils/denbug.js';

export class BrowserWebSocketTransport extends Transport {
  constructor(options = {}) {
    super();
    
    this.trace = denbug.domain('transport:websocket:client');
    this.trace.enable();
    
    this.options = {
      url: 'http://localhost:5000',
      protocols: ['serra', 'mcp'],
      ...options
    };

    this.socket = null;
    this.connected = false;
    this.messageQueue = new Map();
    this.connectPromise = null;
    this.handlers = new Map();
    this.dialogs = new Map();
    
    // Set up protocol handlers
    this.handlers.set('serra', this.handleSerraMessage.bind(this));
    this.handlers.set('mcp', this.handleMCPMessage.bind(this));
    
    connectionStatusService.registerTransport('websocket', this);
    this.trace('Browser WebSocket transport created');

    this.missedHeartbeats = 0;
    this.maxMissedHeartbeats = 3;
  }

  async connect() {
    if (this.connectPromise) return this.connectPromise;

    this.trace('Connecting to WebSocket server...');
    
    this.connectPromise = new Promise((resolve, reject) => {
      this.socket = io(this.options.url, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000
      });

      this.setupSocket();

      this.socket.on('connect', () => {
        this.trace('Connected to server');
        this.connected = true;
        connectionStatusService.setTransportStatus('websocket', 'up');
        this.emit('connection');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        this.trace.error('Connection error:', error);
        connectionStatusService.setTransportStatus('websocket', 'error');
        reject(error);
      });
    });

    return this.connectPromise;
  }

  setupSocket() {
    if (!this.socket) return;

    // Add heartbeat handlers
    this.socket.on('ping', () => {
      this.trace('Received heartbeat ping');
      this.socket.emit('pong');
      this.missedHeartbeats = 0;
    });

    this.socket.on('disconnect', (reason) => {
      this.trace(`Disconnected from server: ${reason}`);
      this.connected = false;
      connectionStatusService.setTransportStatus('websocket', 'down');
      this.emit('disconnection', { reason });
      this.missedHeartbeats = 0;
    });

    // Watch for missed heartbeats
    this.socket.io.on("ping", () => {
      this.missedHeartbeats++;
      if (this.missedHeartbeats >= this.maxMissedHeartbeats) {
        this.trace.warn('Multiple heartbeats missed, connection may be unstable');
        connectionStatusService.setTransportStatus('websocket', 'unstable');
      }
    });

    // Handle protocol messages
    for (const protocol of this.options.protocols) {
      const handler = this.handlers.get(protocol);
      if (handler) {
        this.socket.on(protocol, async (message, ack) => {
          try {
            // Track message in dialog if it belongs to one
            if (message.dialogId) {
              const dialog = this.getDialog(message.dialogId);
              if (dialog) {
                dialog.messages.push(message);
              }
            }

            await handler(message);
            if (typeof ack === 'function') {
              ack({ success: true });
            }
          } catch (error) {
            this.trace.error(`${protocol} handler error:`, error);
            if (typeof ack === 'function') {
              ack({ error: error.message });
            }
          }
        });
      }
    }

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      this.trace(`Reconnection attempt ${attemptNumber}`);
      connectionStatusService.setTransportStatus('websocket', 'connecting');
    });

    this.socket.on('reconnect_failed', () => {
      this.trace.error('Reconnection failed');
      connectionStatusService.setTransportStatus('websocket', 'down');
    });

    this.socket.on('error', (error) => {
      this.trace.error('Socket error:', error);
      this.emit('error', { error });
    });
  }

  async handleSerraMessage(message) {
    const { type, data, room } = message;
    this.trace(`Serra message received`, { 
      structured: { type, room }
    });
    this.emit('message', { 
      protocol: 'serra',
      type,
      data,
      room
    });
  }

  async handleMCPMessage(message) {
    const { method, params } = message;
    this.trace(`MCP message received`, { 
      structured: { method }
    });
    this.emit('message', {
      protocol: 'mcp',
      method,
      params
    });
  }

  async createDialog(dialogId, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.connected) {
        reject(new Error('Not connected'));
        return;
      }

      this.socket.emit('dialog:create', { dialogId, options }, (response) => {
        if (response?.error) {
          this.trace.error(`Failed to create dialog ${dialogId}:`, response.error);
          reject(new Error(response.error));
        } else {
          const dialog = response.dialog;
          this.dialogs.set(dialogId, dialog);
          this.trace(`Created dialog ${dialogId}`);
          resolve(dialog);
        }
      });
    });
  }

  async closeDialog(dialogId) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.connected) {
        reject(new Error('Not connected'));
        return;
      }

      this.socket.emit('dialog:close', { dialogId }, (response) => {
        if (response?.error) {
          this.trace.error(`Failed to close dialog ${dialogId}:`, response.error);
          reject(new Error(response.error));
        } else {
          this.dialogs.delete(dialogId);
          this.trace(`Closed dialog ${dialogId}`);
          resolve();
        }
      });
    });
  }

  getDialog(dialogId) {
    return this.dialogs.get(dialogId);
  }

  async join(room) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.connected) {
        reject(new Error('Not connected'));
        return;
      }

      this.socket.emit('join', room, (response) => {
        if (response?.error) {
          this.trace.error(`Failed to join room ${room}:`, response.error);
          reject(new Error(response.error));
        } else {
          this.trace(`Joined room ${room}`);
          resolve();
        }
      });
    });
  }

  async leave(room) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.connected) {
        reject(new Error('Not connected'));
        return;
      }

      this.socket.emit('leave', room, (response) => {
        if (response?.error) {
          this.trace.error(`Failed to leave room ${room}:`, response.error);
          reject(new Error(response.error));
        } else {
          this.trace(`Left room ${room}`);
          resolve();
        }
      });
    });
  }

  async disconnect() {
    this.trace('Disconnecting...');
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.connected = false;
    this.connectPromise = null;
    connectionStatusService.setTransportStatus('websocket', 'down');
    this.trace('Disconnected');
  }

  isConnected() {
    return this.connected;
  }

  async send(message, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.connected) {
        this.trace('Queueing message - not connected');
        if (!this.messageQueue.has('default')) {
          this.messageQueue.set('default', []);
        }
        this.messageQueue.get('default').push({ 
          message, 
          options,
          resolve, 
          reject 
        });
        return;
      }

      const { protocol = 'serra', room, dialogId } = options;

      try {
        if (dialogId) {
          const dialog = this.getDialog(dialogId);
          if (!dialog || dialog.status !== 'active') {
            throw new Error(`Dialog ${dialogId} not found or inactive`);
          }
          message.dialogId = dialogId;
          dialog.messages.push(message);
        }

        this.trace(`Sending ${protocol} message`, { 
          structured: { message, room, dialogId }
        });

        this.socket.emit(protocol, message, (ack) => {
          if (ack?.error) {
            this.trace.error('Message failed:', ack.error);
            reject(new Error(ack.error));
          } else {
            this.trace('Message acknowledged');
            resolve(ack);
          }
        });
      } catch (error) {
        this.trace.error('Error sending message:', error);
        reject(error);
      }
    });
  }

  async broadcast(message, options = {}) {
    const { protocol = 'serra', room } = options;
    
    this.trace(`Broadcasting ${protocol} message`, {
      structured: { message, room }
    });

    return this.send(message, { 
      ...options,
      broadcast: true 
    });
  }
}

export default BrowserWebSocketTransport;