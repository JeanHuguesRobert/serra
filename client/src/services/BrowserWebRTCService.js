import { WebRTCService } from '@serra/core';

class BrowserWebRTCService extends WebRTCService {
    constructor(socket) {
        super();
        this.socket = socket;
        this.peerConnection = null;
        this.setupSignaling();
    }

    setupSignaling() {
        if (!this.socket) return;

        this.socket.on('webrtc_offer', (offer) => {
            this.handleOffer(offer);
        });

        this.socket.on('webrtc_answer', (answer) => {
            this.handleAnswer(answer);
        });

        this.socket.on('webrtc_ice_candidate', (candidate) => {
            this.handleIceCandidate(candidate);
        });
    }

    async connect() {
        try {
            const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
            this.peerConnection = new RTCPeerConnection(configuration);
            
            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    this.socket.emit('webrtc_ice_candidate', event.candidate);
                }
            };

            this.peerConnection.onconnectionstatechange = () => {
                this.emit('statusChange', this.peerConnection.connectionState);
            };

            this.emit('statusChange', 'connecting');
            return Promise.resolve();
        } catch (error) {
            this.emit('statusChange', 'error');
            throw error;
        }
    }

    async handleOffer(offer) {
        if (!this.peerConnection) await this.connect();

        try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            this.socket.emit('webrtc_answer', answer);
        } catch (error) {
            console.error('Error handling offer:', error);
            this.emit('statusChange', 'error');
        }
    }

    async handleAnswer(answer) {
        try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (error) {
            console.error('Error handling answer:', error);
            this.emit('statusChange', 'error');
        }
    }

    async handleIceCandidate(candidate) {
        try {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
            console.error('Error handling ICE candidate:', error);
        }
    }

    disconnect() {
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        this.emit('statusChange', 'disconnected');
    }
}

export default BrowserWebRTCService;