import { Transport } from './Transport.js';
import { Server } from 'socket.io';
import { connectionStatusService } from './ConnectionStatusService.js';
import denbug from '../utils/denbug.js';

class WebSocketTransport extends Transport {
  constructor(httpServer) {
    super();
    
    this.trace = denbug.domain('transport:websocket');
    this.trace.enable();
    
    this.io = new Server(httpServer, {
      cors: { origin: '*', methods: ['GET', 'POST'] },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    this.connected = false;
    this.messageQueue = new Map();
    this.sockets = new Map();
    this.rooms = new Map();
    this.dialogs = new Map();
    this.protocols = new Set(['serra', 'mcp']);
    this.handlers = new Map();
    
    // Set up protocol handlers
    this.handlers.set('serra', this.handleSerraMessage.bind(this));
    this.handlers.set('mcp', this.handleMCPMessage.bind(this));
    
    connectionStatusService.registerTransport('websocket', this);
    this.trace('WebSocket transport created');

    this.heartbeatInterval = null;
    this.heartbeatTimeout = null;
    this.heartbeatDelay = 30000; // 30 seconds
    this.initHeartbeat();
  }

  initHeartbeat() {
    this.io.on('connect', (socket) => {
      socket.on('pong', () => {
        // Reset timeout on pong
        if (this.heartbeatTimeout) {
          clearTimeout(this.heartbeatTimeout);
        }
      });
    });

    // Start heartbeat interval
    this.heartbeatInterval = setInterval(() => {
      this.trace('Sending heartbeat');
      this.io.emit('ping');
      
      // Set timeout for response
      this.heartbeatTimeout = setTimeout(() => {
        this.trace.error('Heartbeat timeout - connection may be unstable');
        connectionStatusService.setTransportStatus('websocket', 'unstable');
      }, 5000); // 5 second timeout
    }, this.heartbeatDelay);
  }

  async handleSerraMessage(socket, message) {
    try {
      const { type, data, room } = message;
      
      if (room) {
        await this.joinRoom(socket, room);
      }

      this.trace(`Serra message from ${socket.id}`, { 
        structured: { type, room }
      });
      
      this.emit('message', { 
        socketId: socket.id,
        protocol: 'serra',
        type,
        data,
        room
      });
    } catch (error) {
      this.trace.error(`Error handling Serra message:`, error);
      throw error;
    }
  }

  async handleMCPMessage(socket, message) {
    try {
      const { method, params } = message;
      
      this.trace(`MCP message from ${socket.id}`, { 
        structured: { method }
      });
      
      this.emit('message', {
        socketId: socket.id,
        protocol: 'mcp',
        method,
        params
      });
    } catch (error) {
      this.trace.error(`Error handling MCP message:`, error);
      throw error;
    }
  }

  async createDialog(socket, dialogId, options = {}) {
    this.trace(`Creating dialog ${dialogId} for ${socket.id}`);
    
    const dialog = {
      id: dialogId,
      socketId: socket.id,
      options,
      messages: [],
      status: 'active',
      createdAt: Date.now()
    };

    this.dialogs.set(dialogId, dialog);
    await this.joinRoom(socket, `dialog:${dialogId}`);
    
    return dialog;
  }

  async closeDialog(dialogId) {
    const dialog = this.dialogs.get(dialogId);
    if (dialog) {
      this.trace(`Closing dialog ${dialogId}`);
      
      const socket = this.sockets.get(dialog.socketId);
      if (socket) {
        await this.leaveRoom(socket, `dialog:${dialogId}`);
      }
      
      dialog.status = 'closed';
      dialog.closedAt = Date.now();
      this.dialogs.delete(dialogId);
      
      this.emit('dialogClosed', { dialog });
    }
  }

  getDialog(dialogId) {
    return this.dialogs.get(dialogId);
  }

  async joinRoom(socket, room) {
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }
    this.rooms.get(room).add(socket.id);
    await socket.join(room);
    this.trace(`Client ${socket.id} joined room ${room}`);
  }

  async leaveRoom(socket, room) {
    const roomClients = this.rooms.get(room);
    if (roomClients) {
      roomClients.delete(socket.id);
      if (roomClients.size === 0) {
        this.rooms.delete(room);
      }
    }
    await socket.leave(room);
    this.trace(`Client ${socket.id} left room ${room}`);
  }

  async connect() {
    this.trace('Starting WebSocket server...');

    this.io.on('connect', (socket) => {
      this.trace(`Client connected: ${socket.id}`);
      this.sockets.set(socket.id, socket);
      this.connected = true;
      connectionStatusService.setTransportStatus('websocket', 'up');
      
      // Set up protocol and room handlers
      this.setupSocket(socket);
      
      this.emit('connection', socket);

      // Process any queued messages
      if (this.messageQueue.has(socket.id)) {
        const queue = this.messageQueue.get(socket.id);
        this.trace(`Processing queued messages for ${socket.id}, count: ${queue.length}`);
        while (queue.length > 0) {
          const { message, options, resolve, reject } = queue.shift();
          this.send(socket, message, options).then(resolve).catch(reject);
        }
        this.messageQueue.delete(socket.id);
      }

      // Handle dialog-related messages
      socket.on('dialog:create', async ({ dialogId, options }, ack) => {
        try {
          const dialog = await this.createDialog(socket, dialogId, options);
          if (typeof ack === 'function') {
            ack({ success: true, dialog });
          }
        } catch (error) {
          this.trace.error(`Error creating dialog:`, error);
          if (typeof ack === 'function') {
            ack({ error: error.message });
          }
        }
      });

      socket.on('dialog:close', async ({ dialogId }, ack) => {
        try {
          await this.closeDialog(dialogId);
          if (typeof ack === 'function') {
            ack({ success: true });
          }
        } catch (error) {
          this.trace.error(`Error closing dialog:`, error);
          if (typeof ack === 'function') {
            ack({ error: error.message });
          }
        }
      });

      socket.on('error', (error) => {
        this.trace.error(`Socket error from ${socket.id}:`, error);
        this.emit('error', { socketId: socket.id, error });
        connectionStatusService.setTransportStatus('websocket', 'error');
      });

      socket.on('disconnect', async (reason) => {
        this.trace(`Client disconnected: ${socket.id}, reason: ${reason}`);
        
        // Leave all rooms
        for (const [room, clients] of this.rooms) {
          if (clients.has(socket.id)) {
            await this.leaveRoom(socket, room);
          }
        }
        
        this.sockets.delete(socket.id);
        if (this.sockets.size === 0) {
          this.connected = false;
          connectionStatusService.setTransportStatus('websocket', 'down');
        }
        this.emit('disconnection', { socket, reason });
      });

      socket.on('reconnect_attempt', (attemptNumber) => {
        this.trace(`Reconnection attempt ${attemptNumber} for ${socket.id}`);
        connectionStatusService.setTransportStatus('websocket', 'connecting');
      });

      socket.on('reconnect_failed', () => {
        this.trace.error(`Reconnection failed for ${socket.id}`);
        connectionStatusService.setTransportStatus('websocket', 'down');
      });
    });

    this.io.on('error', (error) => {
      this.trace.error('Server error:', error);
      this.connected = false;
      connectionStatusService.setTransportStatus('websocket', 'error');
      this.emit('error', { error });
    });
  }

  async disconnect() {
    this.trace('Disconnecting WebSocket transport...');
    this.messageQueue.clear();
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
    }

    for (const socket of this.sockets.values()) {
      this.trace(`Disconnecting client: ${socket.id}`);
      socket.disconnect(true);
    }
    this.sockets.clear();
    
    await new Promise(resolve => this.io.close(resolve));
    this.connected = false;
    this.trace('WebSocket transport disconnected');
  }

  isConnected() {
    return this.connected;
  }

  async send(socket, message, options = {}) {
    return new Promise((resolve, reject) => {
      if (!socket || !this.sockets.has(socket.id)) {
        this.trace(`Queueing message for disconnected socket: ${socket?.id}`);
        if (!this.messageQueue.has(socket.id)) {
          this.messageQueue.set(socket.id, []);
        }
        this.messageQueue.get(socket.id).push({ 
          message, 
          options,
          resolve, 
          reject 
        });
        return;
      }

      try {
        const { protocol = 'serra', room, dialogId } = options;
        
        if (dialogId) {
          const dialog = this.getDialog(dialogId);
          if (!dialog || dialog.status !== 'active') {
            throw new Error(`Dialog ${dialogId} not found or inactive`);
          }
          message.dialogId = dialogId;
          dialog.messages.push(message);
        }

        this.trace(`Sending ${protocol} message to ${socket.id}`, { 
          structured: { message, room, dialogId }
        });

        if (room) {
          socket.to(room).emit(protocol, message, (ack) => {
            if (ack?.error) {
              this.trace.error(`Room message failed:`, ack.error);
              reject(new Error(ack.error));
            } else {
              this.trace(`Room message acknowledged`);
              resolve(ack);
            }
          });
        } else {
          socket.emit(protocol, message, (ack) => {
            if (ack?.error) {
              this.trace.error(`Message to ${socket.id} failed:`, ack.error);
              reject(new Error(ack.error));
            } else {
              this.trace(`Message to ${socket.id} acknowledged`);
              resolve(ack);
            }
          });
        }
      } catch (error) {
        this.trace.error(`Error sending message to ${socket.id}:`, error);
        reject(error);
      }
    });
  }

  broadcast(message, options = {}) {
    const { protocol = 'serra', room, except = null } = options;
    
    this.trace(`Broadcasting ${protocol} message`, {
      structured: {
        room,
        excludedClient: except?.id,
        protocol
      }
    });

    let targets = this.sockets.values();
    
    if (room) {
      const roomClients = this.rooms.get(room);
      if (!roomClients) return Promise.resolve();
      targets = Array.from(roomClients)
        .map(id => this.sockets.get(id))
        .filter(Boolean);
    }
    
    return Promise.all(
      Array.from(targets)
        .filter(socket => !except || socket.id !== except.id)
        .map(socket => this.send(socket, message, { protocol, room }))
    );
  }

  setupSocket(socket) {
    // Handle protocol messages
    for (const protocol of this.protocols) {
      const handler = this.handlers.get(protocol);
      if (handler) {
        socket.on(protocol, async (message, ack) => {
          try {
            // Track message in dialog if it belongs to one
            if (message.dialogId) {
              const dialog = this.getDialog(message.dialogId);
              if (dialog) {
                dialog.messages.push(message);
              }
            }

            await handler(socket, message);
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

    // Handle room events
    socket.on('join', async (room, ack) => {
      try {
        await this.joinRoom(socket, room);
        if (typeof ack === 'function') {
          ack({ success: true });
        }
      } catch (error) {
        this.trace.error(`Join room error:`, error);
        if (typeof ack === 'function') {
          ack({ error: error.message });
        }
      }
    });

    socket.on('leave', async (room, ack) => {
      try {
        await this.leaveRoom(socket, room);
        if (typeof ack === 'function') {
          ack({ success: true });
        }
      } catch (error) {
        this.trace.error(`Leave room error:`, error);
        if (typeof ack === 'function') {
          ack({ error: error.message });
        }
      }
    });
  }
}

export { WebSocketTransport };