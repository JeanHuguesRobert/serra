import { EventEmitter } from '../utils/EventEmitter.js';

/**
 * Service to track the status of various transport connections
 * Works in both browser and server environments
 */
export class ConnectionStatusService extends EventEmitter {
    constructor() {
        super();
        this.transports = new Map();
        this.desiredStatus = 'up';
        this.actualStatus = 'down';
        this.activeTransport = null;
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
        
        if (this.actualStatus !== newStatus) {
            this.actualStatus = newStatus;
            this.emit('statusChange', this.getConnectionState());
        }
    }

    /**
     * Set the desired connection status
     * @param {string} status - Desired status ('up' or 'down')
     */
    setDesiredStatus(status) {
        if (this.desiredStatus !== status) {
            this.desiredStatus = status;
            this.emit('statusChange', this.getConnectionState());
        }
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
            desired: this.desiredStatus,
            actual: this.actualStatus,
            activeTransport: this.activeTransport,
            transports: transportStates,
            isConnecting: this.desiredStatus === 'up' && this.actualStatus === 'down',
            isConnected: this.actualStatus === 'up',
            isDisconnected: this.actualStatus === 'down'
        };
    }
}

// Export a singleton instance
export const connectionStatusService = new ConnectionStatusService();
