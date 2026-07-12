import { EventEmitter } from '../utils/EventEmitter.js';
import { ActiveState } from '../utils/ActiveState.js';

/**
 * Service to track the status of various transport connections
 * Works in both browser and server environments
 */
export class ConnectionStatusService extends EventEmitter {
    constructor() {
        super();
        this.transports = new Map();
        this.connectionState = new ActiveState('down');
        this.activeTransport = null;

        // Forward state changes to statusChange event
        this.connectionState.subscribe((newValue, oldValue) => {
            this.emit('statusChange', this.getConnectionState());
        });
    }

    /**
     * Register a transport with the service
     * @param {string} id - Transport identifier
     * @param {object} transport - Transport object
     */
    registerTransport(id, transport) {
        this.transports.set(id, {
            transport,
            status: 'down',
            priority: this.transports.size
        });
    }

    /**
     * Update the status of a transport
     * @param {string} id - Transport identifier
     * @param {string} status - New status ('up' or 'down')
     */
    setTransportStatus(id, status) {
        const transport = this.transports.get(id);
        if (transport && transport.status !== status) {
            transport.status = status;
            this.updateOverallStatus();
        }
    }

    /**
     * Update the overall connection status based on transport statuses
     */
    updateOverallStatus() {
        const connectedTransport = Array.from(this.transports.entries())
            .sort(([, a], [, b]) => a.priority - b.priority)
            .find(([, transport]) => transport.status === 'up');

        const newStatus = connectedTransport ? 'up' : 'down';
        this.activeTransport = connectedTransport ? connectedTransport[0] : null;
        
        this.connectionState.set(newStatus);
    }

    /**
     * Set the desired connection status
     * @param {string} status - Desired status ('up' or 'down')
     */
    setDesiredStatus(status) {
        this.connectionState.expect(status);
    }

    /**
     * Get the current connection state
     * @returns {object} - Connection state object
     */
    getConnectionState() {
        const transportStates = {};
        this.transports.forEach((value, id) => {
            transportStates[id] = {
                status: value.status,
                priority: value.priority
            };
        });

        return {
            desired: this.connectionState.desired(),
            actual: this.connectionState.current(),
            activeTransport: this.activeTransport,
            transports: transportStates,
            isConnecting: !this.connectionState.stable() && this.connectionState.desired() === 'up',
            isConnected: this.connectionState.current() === 'up',
            isDisconnecting: !this.connectionState.stable() && this.connectionState.desired() === 'down',
            isDisconnected: this.connectionState.current() === 'down'
        };
    }
}

// Export a singleton instance
export const connectionStatusService = new ConnectionStatusService();
