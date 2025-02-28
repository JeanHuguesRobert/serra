import { EventEmitter } from '../utils/EventEmitter.js';

/**
 * Base chat service that provides a common interface for messaging
 * Platform-agnostic implementation that can be extended for specific environments
 */
export class ChatService extends EventEmitter {
    constructor() {
        super();
        this.aiProvider = null;
        this.messageHistory = [];
    }

    /**
     * Set the AI provider for the chat service
     * @param {string} provider - Provider identifier
     */
    setAiProvider(provider) {
        this.aiProvider = provider;
    }

    /**
     * Send a message through the chat service
     * @param {Object} message - Message object
     * @param {string} systemPrompt - System prompt for AI
     * @returns {Promise<Object>} - Response message
     */
    async sendMessage(message, systemPrompt = '') {
        throw new Error('sendMessage method must be implemented by concrete classes');
    }

    /**
     * Register a listener for incoming messages
     * @param {Function} callback - Message handler
     * @returns {Function} - Unsubscribe function
     */
    onMessage(callback) {
        this.on('message', callback);
        return () => this.off('message', callback);
    }

    /**
     * Add a message to the history
     * @param {Object} message - Message to add
     * @private
     */
    _addToHistory(message) {
        this.messageHistory.push({
            ...message,
            timestamp: Date.now()
        });
        
        // Limit history size
        if (this.messageHistory.length > 100) {
            this.messageHistory.shift();
        }
    }

    /**
     * Get the message history
     * @param {number} limit - Maximum number of messages to return
     * @returns {Array<Object>} - Message history
     */
    getHistory(limit = 50) {
        return this.messageHistory.slice(-limit);
    }

    /**
     * Clear the message history
     */
    clearHistory() {
        this.messageHistory = [];
    }
}
