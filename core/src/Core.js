/**
 * Core module for managing peer-to-peer communication with dialog interfaces
 * and multiple transport mechanisms.
 */

import { EventEmitter } from 'events';
import http2 from 'http2';
import { WebSocketTransport } from './services/WebSocketTransport.js';

class Dialog {
  constructor(transport, options = {}) {
    this.transport = transport;
    this.options = {
      protocol: 'serra',
      room: null,
      ...options
    };
    this.messageHandlers = new Map();

    // Subscribe to transport messages with protocol filtering
    this.transport.on('message', (message) => {
      if (message.protocol === this.options.protocol) {
        this.handleMessage(message);
      }
    });
  }

  /**
   * Register an event handler for incoming messages
   * @param {string} event - The event name to listen for
   * @param {Function} handler - The handler function to call when the event is received
   */
  on(event, handler) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, new Set());
    }
    this.messageHandlers.get(event).add(handler);
  }

  off(event, handler) {
    if (this.messageHandlers.has(event)) {
      this.messageHandlers.get(event).delete(handler);
    }
  }

  async send(event, data) {
    return this.transport.send({
      event,
      data,
      room: this.options.room
    }, {
      protocol: this.options.protocol,
      room: this.options.room
    });
  }

  async joinRoom(room) {
    this.options.room = room;
    // If using WebSocket transport, explicitly join the room
    if (this.transport.constructor.name === 'WebSocketTransport') {
      await this.transport.joinRoom(this.options.socketId, room);
    }
  }

  async leaveRoom() {
    if (this.options.room && this.transport.constructor.name === 'WebSocketTransport') {
      await this.transport.leaveRoom(this.options.socketId, this.options.room);
    }
    this.options.room = null;
  }

  /**
   * Handle an incoming message
   * @param {Object} message - The message object
   * @param {string} message.event - The event name
   * @param {*} message.data - The message data
   */
  async handleMessage(message) {
    const { event, data } = message;
    if (this.messageHandlers.has(event)) {
      for (const handler of this.messageHandlers.get(event)) {
        await handler(data);
      }
    }
  }
}


class Transport extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = options;
  }

  async connect() {
    throw new Error('Transport.connect() must be implemented by subclass');
  }

  async disconnect() {
    throw new Error('Transport.disconnect() must be implemented by subclass');
  }

  async send(message) {
    throw new Error('Transport.send() must be implemented by subclass');
  }
}

class HTTPTransport extends Transport {
  constructor(config) {
    super();
    this.baseUrl = config.baseUrl;
    this.connected = false;
    this.headers = {
      'Content-Type': 'application/json'
    };
    this.client = http2.connect(this.baseUrl);
    this.client.on('stream', (stream, headers) => {
      if (headers[':path'] === '/push') {
        let data = '';
        stream.on('data', (chunk) => { data += chunk; });
        stream.on('end', () => {
          this.emit('push', JSON.parse(data));
        });
      }
    });
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.client.on('connect', () => {
        this.connected = true;
        resolve();
      });
      this.client.on('error', (error) => {
        this.connected = false;
        reject(error);
      });
    });
  }

  async disconnect() {
    this.client.close();
    this.connected = false;
  }

  isConnected() {
    return this.connected;
  }

  async send(message) {
    if (!this.isConnected()) {
      throw new Error('Transport not connected');
    }
    return new Promise((resolve, reject) => {
      const req = this.client.request({
        ':method': 'POST',
        ':path': '/message',
        ...this.headers
      });
      req.setEncoding('utf8');
      req.on('response', (headers, flags) => {
        let data = '';
        req.on('data', (chunk) => { data += chunk; });
        req.on('end', () => {
          if (headers[':status'] !== 200) {
            reject(new Error(`HTTP error! status: ${headers[':status']}`));
          } else {
            resolve(JSON.parse(data));
          }
        });
      });
      req.on('error', reject);
      req.write(JSON.stringify(message));
      req.end();
    });
  }
}

class WebRTCTransport extends Transport {
  async connect() {
    // Implementation for WebRTC transport
  }

  async disconnect() {
    // Implementation for WebRTC transport
  }

  async send(message) {
    // Implementation for WebRTC transport
  }
}

class Core extends EventEmitter {
  constructor() {
    super();
    this.transports = new Map();
    this.dialogs = new Map();
  }

  registerTransport(type, transport) {
    this.transports.set(type, transport);
    transport.on('message', (message) => this.handleMessage(message));
    transport.on('connection', (connection) => this.handleConnection(connection));
    transport.on('disconnection', (connection) => this.handleDisconnection(connection));
  }

  unregisterTransport(type) {
    const transport = this.transports.get(type);
    if (transport) {
      transport.removeAllListeners();
      this.transports.delete(type);
    }
  }

  createDialog(id, options = {}) {
    const dialog = {
      id,
      options,
      messages: [],
      status: 'active'
    };
    this.dialogs.set(id, dialog);
    return dialog;
  }

  closeDialog(id) {
    const dialog = this.dialogs.get(id);
    if (dialog) {
      dialog.status = 'closed';
      this.emit('dialogClosed', dialog);
      this.dialogs.delete(id);
    }
  }

  async sendMessage(transportType, message, options = {}) {
    const transport = this.transports.get(transportType);
    if (!transport) {
      throw new Error(`Transport ${transportType} not found`);
    }
    return transport.send(message, options);
  }

  handleMessage(message) {
    const dialog = this.dialogs.get(message.dialogId);
    if (dialog) {
      dialog.messages.push(message);
      this.emit('message', { dialog, message });
    }
  }

  handleConnection(connection) {
    this.emit('connection', connection);
  }

  handleDisconnection(connection) {
    this.emit('disconnection', connection);
  }

  async initialize(options = {}) {
    this.options = options;
    this.emit('initialized', options);
  }

  async shutdown() {
    for (const [type, transport] of this.transports) {
      await transport.disconnect();
      this.unregisterTransport(type);
    }
    this.dialogs.clear();
    this.emit('shutdown');
  }
}

/**
 * DNS-like system for core identification and discovery
 * Implements hierarchical naming system with parent/child relationships
 * and fault-tolerant top-level cores
 */

class CoreDNS {
  constructor() {
      this.cores = new Map();
      this.relationships = new Map();
      this.topLevelCores = new Set();
  }

  /**
   * Register a new core in the DNS system
   * @param {string} coreId - Unique identifier for the core
   * @param {Object} coreInfo - Information about the core (address, capabilities, etc)
   * @param {string} parentId - Optional parent core identifier
   */
  registerCore(coreId, coreInfo, parentId = null) {
      this.cores.set(coreId, coreInfo);
      
      if (parentId) {
          if (!this.relationships.has(parentId)) {
              this.relationships.set(parentId, new Set());
          }
          this.relationships.get(parentId).add(coreId);
      } else {
          this.topLevelCores.add(coreId);
      }
  }

  /**
   * Remove a core from the DNS system
   * @param {string} coreId - Identifier of the core to remove
   */
  unregisterCore(coreId) {
      this.cores.delete(coreId);
      this.topLevelCores.delete(coreId);
      
      // Remove from relationships
      for (const [parentId, children] of this.relationships) {
          children.delete(coreId);
          if (children.size === 0) {
              this.relationships.delete(parentId);
          }
      }
      this.relationships.delete(coreId);
  }

  /**
   * Lookup core information by ID
   * @param {string} coreId - Core identifier to look up
   * @returns {Object|null} Core information or null if not found
   */
  lookupCore(coreId) {
      return this.cores.get(coreId) || null;
  }

  /**
   * Get all child cores for a given parent
   * @param {string} parentId - Parent core identifier
   * @returns {Set<string>} Set of child core IDs
   */
  getChildCores(parentId) {
      return this.relationships.get(parentId) || new Set();
  }

  /**
   * Get all top-level cores
   * @returns {Set<string>} Set of top-level core IDs
   */
  getTopLevelCores() {
      return new Set(this.topLevelCores);
  }

  /**
   * Update core information
   * @param {string} coreId - Core identifier
   * @param {Object} newInfo - Updated core information
   */
  updateCoreInfo(coreId, newInfo) {
      if (this.cores.has(coreId)) {
          this.cores.set(coreId, { ...this.cores.get(coreId), ...newInfo });
      }
  }
}


class Gateway extends EventEmitter {
    constructor() {
        super();
        this.transports = new Map();
        this.dialogs = new Map();
    }

    // Transport management
    registerTransport(type, transport) {
        this.transports.set(type, transport);
        transport.on('message', (message) => this.handleMessage(message));
        transport.on('connection', (connection) => this.handleConnection(connection));
        transport.on('disconnection', (connection) => this.handleDisconnection(connection));
    }

    unregisterTransport(type) {
        const transport = this.transports.get(type);
        if (transport) {
            transport.removeAllListeners();
            this.transports.delete(type);
        }
    }

    // Dialog management
    createDialog(id, options = {}) {
        const dialog = {
            id,
            options,
            messages: [],
            status: 'active'
        };
        this.dialogs.set(id, dialog);
        return dialog;
    }

    closeDialog(id) {
        const dialog = this.dialogs.get(id);
        if (dialog) {
            dialog.status = 'closed';
            this.emit('dialogClosed', dialog);
            this.dialogs.delete(id);
        }
    }

    // Message handling
    async sendMessage(transportType, message, options = {}) {
        const transport = this.transports.get(transportType);
        if (!transport) {
            throw new Error(`Transport ${transportType} not found`);
        }
        return transport.send(message, options);
    }

    handleMessage(message) {
        const dialog = this.dialogs.get(message.dialogId);
        if (dialog) {
            dialog.messages.push(message);
            this.emit('message', { dialog, message });
        }
    }

    // Connection management
    handleConnection(connection) {
        this.emit('connection', connection);
    }

    handleDisconnection(connection) {
        this.emit('disconnection', connection);
    }

    // Utility methods
    getActiveDialogs() {
        return Array.from(this.dialogs.values())
            .filter(dialog => dialog.status === 'active');
    }

    getTransports() {
        return Array.from(this.transports.keys());
    }

    async initialize(options = {}) {
        this.options = options;
        this.emit('initialized', options);
    }

    async shutdown() {
        for (const [type, transport] of this.transports) {
            await transport.disconnect();
            this.unregisterTransport(type);
        }
        this.dialogs.clear();
        this.emit('shutdown');
    }
}

export {
  Core,
  CoreDNS,
  Dialog,
  Transport,
  Gateway,
  HTTPTransport,
  WebSocketTransport,
  WebRTCTransport
};