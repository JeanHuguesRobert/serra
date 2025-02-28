import { WebRTCService } from '@serra/core';
import ConnectionStatusService from './ConnectionStatusService.js';
import SocketService from './SocketService.js';

class BrowserWebRTCService extends WebRTCService {
    constructor() {
        super();
        
        // Register as a transport in ConnectionStatusService
        ConnectionStatusService.registerTransport('webrtc', this);
        
        // Setup signaling through WebSocket
        this.setupSignaling(SocketService);
    }

    async connect() {
        if (this.connected) return Promise.resolve();

        this.connectPromise = new Promise(async (resolve, reject) => {
            try {
                this.peerConnection = new RTCPeerConnection({
                    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
                });

                this.peerConnection.onicecandidate = (event) => {
                    if (event.candidate) {
                        this.socketService.emit('webrtc_ice_candidate', event.candidate);
                    }
                };

                this.dataChannel = this.peerConnection.createDataChannel('serra');
                this.setupDataChannel(this.dataChannel);

                const offer = await this.peerConnection.createOffer();
                await this.peerConnection.setLocalDescription(offer);
                this.socketService.emit('webrtc_offer', offer);

                resolve();
            } catch (error) {
                reject(error);
            }
        });

        return this.connectPromise;
    }

    async handleOffer(offer) {
        try {
            if (!this.peerConnection) {
                this.peerConnection = new RTCPeerConnection({
                    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
                });

                this.peerConnection.onicecandidate = (event) => {
                    if (event.candidate) {
                        this.socketService.emit('webrtc_ice_candidate', event.candidate);
                    }
                };

                this.peerConnection.ondatachannel = (event) => {
                    this.dataChannel = event.channel;
                    this.setupDataChannel(this.dataChannel);
                };
            }

            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            this.socketService.emit('webrtc_answer', answer);
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    }

    async handleAnswer(answer) {
        try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    }

    async handleIceCandidate(candidate) {
        try {
            if (this.peerConnection) {
                await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            }
        } catch (error) {
            console.error('Error handling ICE candidate:', error);
        }
    }

    setupDataChannel(channel) {
        channel.onopen = () => {
            this.connected = true;
            ConnectionStatusService.setTransportStatus('webrtc', 'up');
            this.emit('statusChange', 'up');
            console.log('WebRTC data channel opened');
        };

        channel.onclose = () => {
            this.connected = false;
            ConnectionStatusService.setTransportStatus('webrtc', 'down');
            this.emit('statusChange', 'down');
            console.log('WebRTC data channel closed');
        };

        channel.onerror = (error) => {
            console.error('WebRTC data channel error:', error);
            ConnectionStatusService.setTransportStatus('webrtc', 'down');
            this.emit('statusChange', 'down');
        };

        channel.onmessage = (event) => {
            try {
                const { type, data } = JSON.parse(event.data);
                const callbacks = this.messageCallbacks.get(type) || [];
                callbacks.forEach(callback => callback(data));
            } catch (error) {
                console.error('Error handling WebRTC message:', error);
            }
        };
    }

    disconnect() {
        if (this.dataChannel) {
            this.dataChannel.close();
        }
        if (this.peerConnection) {
            this.peerConnection.close();
        }
        this.dataChannel = null;
        this.peerConnection = null;
        this.connected = false;
        this.connectPromise = null;
        ConnectionStatusService.setTransportStatus('webrtc', 'down');
        this.emit('statusChange', 'down');
    }

    emit(type, data) {
        if (type === 'statusChange') {
            super.emit(type, data);
            return;
        }

        if (this.dataChannel && this.connected) {
            this.dataChannel.send(JSON.stringify({ type, data }));
        } else {
            console.warn('WebRTC data channel is not connected');
        }
    }
}

export default new BrowserWebRTCService();