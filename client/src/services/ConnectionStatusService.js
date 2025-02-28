class ConnectionStatusService {
    static instance = null;
    
    constructor() {
        if (ConnectionStatusService.instance) {
            return ConnectionStatusService.instance;
        }
        this.transports = new Map();
        this.desiredStatus = 'up';
        this.actualStatus = 'down';
        this.statusChangeCallbacks = [];
        this.activeTransport = null;
        ConnectionStatusService.instance = this;
    }

    registerTransport(id, transport) {
        this.transports.set(id, {
            transport,
            status: 'down',
            priority: this.transports.size
        });
    }

    setTransportStatus(id, status) {
        const transport = this.transports.get(id);
        if (transport && transport.status !== status) {
            transport.status = status;
            this.updateOverallStatus();
        }
    }

    updateOverallStatus() {
        const connectedTransport = Array.from(this.transports.entries())
            .sort(([, a], [, b]) => a.priority - b.priority)
            .find(([, transport]) => transport.status === 'up');

        const newStatus = connectedTransport ? 'up' : 'down';
        this.activeTransport = connectedTransport ? connectedTransport[0] : null;
        
        if (this.actualStatus !== newStatus) {
            this.actualStatus = newStatus;
            this.notifyStatusChange();
        }
    }

    setDesiredStatus(status) {
        if (this.desiredStatus !== status) {
            this.desiredStatus = status;
            this.notifyStatusChange();
        }
    }

    setActualStatus(status) {
        if (this.actualStatus !== status) {
            this.actualStatus = status;
            this.notifyStatusChange();
        }
    }

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

    getLEDStatus() {
        if (this.desiredStatus === 'up' && this.actualStatus === 'down') {
            return 'orange'; // Connecting state
        } else if (this.actualStatus === 'up') {
            return 'green'; // Connected state
        } else {
            return 'red'; // Disconnected state
        }
    }

    onStatusChange(callback) {
        this.statusChangeCallbacks.push(callback);
        return () => {
            const index = this.statusChangeCallbacks.indexOf(callback);
            if (index !== -1) {
                this.statusChangeCallbacks.splice(index, 1);
            }
        };
    }

    notifyStatusChange() {
        const state = this.getConnectionState();
        this.statusChangeCallbacks.forEach(callback => callback(state));
    }
}

export default new ConnectionStatusService();