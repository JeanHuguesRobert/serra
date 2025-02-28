import { SocketService } from './socket.js';

export class ClientSocket extends SocketService {
    constructor(url) {
        super();
        this.url = url;
        this.socket = null;
    }

    async connect() {
        if (this.connected) return;

        try {
            // In browser environment, use WebSocket
            this.socket = new WebSocket(this.url);

            return new Promise((resolve, reject) => {
                this.socket.onopen = () => {
                    this.connected = true;
                    this.emit('statusChange', true);
                    resolve();
                };

                this.socket.onclose = () => {
                    this.connected = false;
                    this.emit('statusChange', false);
                };

                this.socket.onerror = (error) => {
                    reject(error);
                };

                this.socket.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        this.emit(message.type, message.data);
                    } catch (error) {
                        console.error('Failed to parse message:', error);
                    }
                };
            });
        } catch (error) {
            throw new Error(`Failed to connect: ${error.message}`);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.connected = false;
            this.emit('statusChange', false);
        }
    }

    emit(type, data) {
        if (!this.connected) {
            throw new Error('Socket is not connected');
        }

        const message = JSON.stringify({ type, data });
        this.socket.send(message);
    }
}