import { EventEmitter } from '../utils/EventEmitter.js';
export { createClientSocket, createServerSocket } from './factory.js';

/**
 * Platform-agnostic socket service that works in both browser and server environments
 * Provides a common interface for socket communication
 */
export class SocketService extends EventEmitter {
    constructor() {
        super();
        this.connected = false;
        this.connectPromise = null;
    }

    /**
     * Connect to the socket server
     * @returns {Promise} - Resolves when connected
     */
    async connect() {
        throw new Error('connect method must be implemented by concrete classes');
    }

    /**
     * Disconnect from the socket server
     */
    disconnect() {
        throw new Error('disconnect method must be implemented by concrete classes');
    }

    /**
     * Send a message through the socket
     * @param {string} type - Message type
     * @param {any} data - Message data
     */
    emit(type, data) {
        throw new Error('emit method must be implemented by concrete classes');
    }

    /**
     * Check if connected to the socket server
     * @returns {boolean} - Connection status
     */
    isConnected() {
        return this.connected;
    }

    /**
     * Set a callback for connection status changes
     * @param {Function} callback - Status change handler
     */
    setConnectionStatusCallback(callback) {
        this.on('statusChange', callback);
    }
}