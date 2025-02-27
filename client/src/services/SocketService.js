import io from 'socket.io-client';

class SocketService {
    static instance = null;
    
    constructor() {
        if (SocketService.instance) {
            return SocketService.instance;
        }
        this.socket = null;
        this.connected = false;
        this.connectPromise = null;
        SocketService.instance = this;
    }

    connect(url = 'http://localhost:3000') {
        if (this.socket) return this.connectPromise;

        this.connectPromise = new Promise((resolve, reject) => {
            this.socket = io(url, {
                transports: ['websocket'],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: Infinity
            });

            this.socket.on('connect', () => {
                this.connected = true;
                console.log('Socket connected');
                resolve(this.socket);
            });

            this.socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                reject(error);
            });

            this.socket.on('disconnect', () => {
                this.connected = false;
                console.log('Socket disconnected');
            });
        });

        return this.connectPromise;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
            this.connectPromise = null;
        }
    }

    emit(event, data) {
        if (this.socket && this.connected) {
            this.socket.emit(event, data);
        } else {
            console.warn('Socket is not connected');
        }
    }

    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    isConnected() {
        return this.connected;
    }

    static async requestDashboard(dashboardId) {
        await SocketService.instance.connectPromise;
        return SocketService.instance.requestDashboard(dashboardId);
    }

    static async setCurrentDashboard(dashboardId) {
        await SocketService.instance.connectPromise;
        return SocketService.instance.setCurrentDashboard(dashboardId);
    }

    static async emit(event, data) {
        await SocketService.instance.connectPromise;
        return SocketService.instance.emit(event, data);
    }

    static on(event, callback) {
        return SocketService.instance.on(event, callback);
    }

    static off(event, callback) {
        return SocketService.instance.off(event, callback);
    }

    static isConnected() {
        return SocketService.instance.isConnected();
    }

    static async connect(url) {
        return SocketService.instance.connect(url);
    }

    static disconnect() {
        return SocketService.instance.disconnect();
    }

    async requestDashboard(dashboardId) {
        return new Promise((resolve, reject) => {
            if (!this.socket || !this.connected) {
                reject(new Error('Socket is not connected'));
                return;
            }

            this.socket.emit('request_dashboard', { dashboardId });
            
            const onDashboardData = (data) => {
                this.socket.off('dashboard_error', onDashboardError);
                resolve(data);
            };

            const onDashboardError = (error) => {
                this.socket.off('dashboard_data', onDashboardData);
                reject(error);
            };

            this.socket.once('dashboard_data', onDashboardData);
            this.socket.once('dashboard_error', onDashboardError);

            setTimeout(() => {
                this.socket.off('dashboard_data', onDashboardData);
                this.socket.off('dashboard_error', onDashboardError);
                reject(new Error('Dashboard request timed out'));
            }, 5000);
        });
    }

    async setCurrentDashboard(dashboardId) {
        return new Promise((resolve, reject) => {
            if (!this.socket || !this.connected) {
                reject(new Error('Socket is not connected'));
                return;
            }

            this.socket.emit('set_current_dashboard', { dashboardId });
            
            const onDashboardSet = (data) => {
                this.socket.off('dashboard_error', onDashboardError);
                resolve(data);
            };

            const onDashboardError = (error) => {
                this.socket.off('dashboard_set', onDashboardSet);
                reject(error);
            };

            this.socket.once('dashboard_set', onDashboardSet);
            this.socket.once('dashboard_error', onDashboardError);

            setTimeout(() => {
                this.socket.off('dashboard_set', onDashboardSet);
                this.socket.off('dashboard_error', onDashboardError);
                reject(new Error('Set dashboard request timed out'));
            }, 5000);
        });
    }
}

// Create a singleton instance
const socketService = new SocketService();

export { SocketService };
export default socketService;