import io from 'socket.io-client';
import { SocketService as CoreSocketService } from '@serra/core';

class BrowserSocketService extends CoreSocketService {
    constructor() {
        super();
        this.socket = null;
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
                this.emit('statusChange', 'connected');
                resolve(this.socket);
            });

            this.socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                this.emit('statusChange', 'error');
                reject(error);
            });

            this.socket.on('disconnect', () => {
                this.connected = false;
                console.log('Socket disconnected');
                this.emit('statusChange', 'disconnected');
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
            this.emit('statusChange', 'disconnected');
        }
    }

    emit(event, data) {
        if (event === 'statusChange') {
            super.emit(event, data);
            return;
        }

        if (this.socket && this.connected) {
            this.socket.emit(event, data);
        } else {
            console.warn('Socket is not connected');
        }
    }

    on(event, callback) {
        if (event === 'statusChange') {
            super.on(event, callback);
            return;
        }

        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event, callback) {
        if (event === 'statusChange') {
            super.off(event, callback);
            return;
        }

        if (this.socket) {
            this.socket.off(event, callback);
        }
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
const socketService = new BrowserSocketService();

export default socketService;