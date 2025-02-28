import { ClientSocket } from './ClientSocket.js';

/**
 * Creates a client socket instance
 * @param {string} url - WebSocket server URL
 * @returns {ClientSocket} - Client socket instance
 */
export function createClientSocket(url) {
    return new ClientSocket(url);
}

/**
 * Creates a server socket instance
 * Note: This is a placeholder for server-side socket implementation
 * @param {Object} options - Server socket options
 * @returns {SocketService} - Server socket instance
 */
export function createServerSocket(options = {}) {
    throw new Error('Server socket implementation is not available in this environment');
}