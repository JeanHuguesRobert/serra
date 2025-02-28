import { ClientSocket } from './ClientSocket.js';

export const createClientSocket = (url) => {
    return new ClientSocket(url);
};

export const createServerSocket = (server) => {
    throw new Error('Server socket implementation is not yet available');
};

export { ClientSocket } from './ClientSocket.js';
export { SocketService } from './socket.js';