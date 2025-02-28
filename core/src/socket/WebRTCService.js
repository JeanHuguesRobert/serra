import { EventEmitter } from '../utils/EventEmitter.js';

/**
 * Platform-agnostic WebRTC service that works in both browser and server environments
 * Provides a common interface for WebRTC communication
 */
export class WebRTCService extends EventEmitter {
    constructor() {
        super();
        this.connected = false;
        this.connectPromise = null;
        this.messageCallbacks = new Map();
    }

    /**
     * Set up signaling for WebRTC through a socket service
     * @param {object} socketService - Socket service for signaling
     */
    setupSignaling(socketService) {
        this.socketService = socketService;

        socketService.on('webrtc_offer', async (offer) => {
            await this.handleOffer(offer);
        });

        socketService.on('webrtc_answer', async (answer) => {
            await this.handleAnswer(answer);
        });

        socketService.on('webrtc_ice_candidate', async (candidate) => {
            await this.handleIceCandidate(candidate);
        });
    }

    /**
     * Connect to a peer using WebRTC
     * @returns {Promise} - Resolves when connected
     */
    async connect() {
        throw new Error('connect method must be implemented by concrete classes');
    }

    /**
     * Handle an incoming WebRTC offer
     * @param {object} offer - SDP offer
     */
    async handleOffer(offer) {
        throw new Error('handleOffer method must be implemented by concrete classes');
    }

    /**
     * Handle an incoming WebRTC answer
     * @param {object} answer - SDP answer
     */
    async handleAnswer(answer) {
        throw new Error('handleAnswer method must be implemented by concrete classes');
    }

    /**
     * Handle an incoming ICE candidate
     * @param {object} candidate - ICE candidate
     */
    async handleIceCandidate(candidate) {
        throw new Error('handleIceCandidate method must be implemented by concrete classes');
    }

    /**
     * Disconnect from the peer
     */
    disconnect() {
        throw new Error('disconnect method must be implemented by concrete classes');
    }

    /**
     * Emit an event through the data channel
     * @param {string} type - Event type
     * @param {any} data - Event data
     */
    emit(type, data) {
        throw new Error('emit method must be implemented by concrete classes');
    }

    /**
     * Register a listener for an event
     * @param {string} type - Event type
     * @param {Function} callback - Event handler
     */
    on(type, callback) {
        if (!this.messageCallbacks.has(type)) {
            this.messageCallbacks.set(type, []);
        }
        this.messageCallbacks.get(type).push(callback);
    }

    /**
     * Remove a listener from an event
     * @param {string} type - Event type
     * @param {Function} callback - Event handler
     */
    off(type, callback) {
        if (this.messageCallbacks.has(type)) {
            const callbacks = this.messageCallbacks.get(type);
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Check if connected to a peer
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