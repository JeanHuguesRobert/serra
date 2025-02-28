import { EventEmitter } from '../utils/EventEmitter.js';

/**
 * Platform-agnostic socket service that can be used by both client and server
 * Concrete implementations should extend this base class and provide platform-specific
 * functionality for socket connections.
 */
export class SocketService extends EventEmitter {
  constructor() {
    super();
    this.connected = false;
    this.connectPromise = null;
  }

  /**
   * Connect to a socket endpoint
   * @param {string} url - The URL to connect to
   * @returns {Promise} - Resolves when connected
   */
  connect(url) {
    throw new Error('connect method must be implemented by concrete classes');
  }

  /**
   * Disconnect from the socket
   */
  disconnect() {
    throw new Error('disconnect method must be implemented by concrete classes');
  }

  /**
   * Emit an event through the socket
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  emit(event, data) {
    throw new Error('emit method must be implemented by concrete classes');
  }

  /**
   * Register a listener for a socket event
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   */
  on(event, callback) {
    throw new Error('on method must be implemented by concrete classes');
  }

  /**
   * Remove a listener from a socket event
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   */
  off(event, callback) {
    throw new Error('off method must be implemented by concrete classes');
  }

  /**
   * Check if the socket is connected
   * @returns {boolean} - Connection status
   */
  isConnected() {
    return this.connected;
  }

  /**
   * Request data for a specific dashboard
   * @param {string} dashboardId - Dashboard identifier
   * @returns {Promise} - Resolves with dashboard data
   */
  async requestDashboard(dashboardId) {
    throw new Error('requestDashboard method must be implemented by concrete classes');
  }

  /**
   * Set the current dashboard
   * @param {string} dashboardId - Dashboard identifier
   * @returns {Promise} - Resolves when dashboard is set
   */
  async setCurrentDashboard(dashboardId) {
    throw new Error('setCurrentDashboard method must be implemented by concrete classes');
  }
}
