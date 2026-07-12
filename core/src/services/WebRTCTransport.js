import { Transport } from './Transport.js';
import { connectionStatusService } from './ConnectionStatusService.js';
import denbug from '../utils/denbug.js';

class WebRTCTransport extends Transport {
  constructor(options = {}) {
    super();
    
    this.trace = denbug.domain('transport:webrtc');
    this.trace.enable();
    
    this.options = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ],
      ...options
    };

    this.connected = false;
    this.connections = new Map(); // Peer connections by peer ID
    this.dataChannels = new Map(); // Data channels by peer ID
    this.messageQueue = new Map(); // Queued messages by peer ID
    
    connectionStatusService.registerTransport('webrtc', this);
    this.trace('WebRTC transport created');
  }

  async connect() {
    this.trace('Initializing WebRTC transport...');
    this.connected = true;
    connectionStatusService.setTransportStatus('webrtc', 'up');
    this.emit('connection');
    return true;
  }

  async createPeerConnection(peerId, isInitiator = false) {
    this.trace(`Creating peer connection for ${peerId}`);
    
    const peerConnection = new RTCPeerConnection(this.options);
    this.connections.set(peerId, peerConnection);

    // Set up event handlers
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.trace(`ICE candidate for ${peerId}`, { structured: event.candidate });
        this.emit('iceCandidate', { peerId, candidate: event.candidate });
      }
    };

    peerConnection.onconnectionstatechange = () => {
      this.trace(`Connection state changed for ${peerId}: ${peerConnection.connectionState}`);
      this.handleConnectionStateChange(peerId, peerConnection.connectionState);
    };

    if (isInitiator) {
      this.trace(`Creating data channel for ${peerId}`);
      const dataChannel = peerConnection.createDataChannel('serra');
      this.setupDataChannel(peerId, dataChannel);
    } else {
      peerConnection.ondatachannel = (event) => {
        this.trace(`Received data channel for ${peerId}`);
        this.setupDataChannel(peerId, event.channel);
      };
    }

    return peerConnection;
  }

  setupDataChannel(peerId, dataChannel) {
    this.dataChannels.set(peerId, dataChannel);

    dataChannel.onopen = () => {
      this.trace(`Data channel opened for ${peerId}`);
      this.processQueuedMessages(peerId);
    };

    dataChannel.onclose = () => {
      this.trace(`Data channel closed for ${peerId}`);
      this.dataChannels.delete(peerId);
    };

    dataChannel.onerror = (error) => {
      this.trace.error(`Data channel error for ${peerId}:`, error);
      this.emit('error', { peerId, error });
    };

    dataChannel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.trace(`Message received from ${peerId}`, { structured: message });
        this.emit('message', { peerId, message });
      } catch (error) {
        this.trace.error(`Error handling message from ${peerId}:`, error);
        this.emit('error', { peerId, error });
      }
    };
  }

  async handleConnectionStateChange(peerId, state) {
    switch (state) {
      case 'connected':
        connectionStatusService.setTransportStatus('webrtc', 'up');
        break;
      case 'disconnected':
      case 'failed':
      case 'closed':
        this.connections.delete(peerId);
        this.dataChannels.delete(peerId);
        if (this.connections.size === 0) {
          connectionStatusService.setTransportStatus('webrtc', 'down');
        }
        this.emit('disconnection', { peerId });
        break;
    }
  }

  async processQueuedMessages(peerId) {
    if (this.messageQueue.has(peerId)) {
      const queue = this.messageQueue.get(peerId);
      this.trace(`Processing queued messages for ${peerId}, count: ${queue.length}`);
      while (queue.length > 0) {
        const { message, resolve, reject } = queue.shift();
        try {
          await this.send(peerId, message);
          resolve();
        } catch (error) {
          reject(error);
        }
      }
      this.messageQueue.delete(peerId);
    }
  }

  async createOffer(peerId) {
    const peerConnection = await this.createPeerConnection(peerId, true);
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    return offer;
  }

  async handleOffer(peerId, offer) {
    const peerConnection = await this.createPeerConnection(peerId, false);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    return answer;
  }

  async handleAnswer(peerId, answer) {
    const peerConnection = this.connections.get(peerId);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  async handleIceCandidate(peerId, candidate) {
    const peerConnection = this.connections.get(peerId);
    if (peerConnection) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  async disconnect() {
    this.trace('Disconnecting WebRTC transport...');
    this.messageQueue.clear();
    
    for (const [peerId, connection] of this.connections) {
      this.trace(`Closing connection to peer: ${peerId}`);
      connection.close();
    }
    
    this.connections.clear();
    this.dataChannels.clear();
    this.connected = false;
    connectionStatusService.setTransportStatus('webrtc', 'down');
    this.trace('WebRTC transport disconnected');
  }

  isConnected() {
    return this.connected;
  }

  async send(peerId, message) {
    return new Promise((resolve, reject) => {
      const dataChannel = this.dataChannels.get(peerId);
      
      if (!dataChannel || dataChannel.readyState !== 'open') {
        this.trace(`Queueing message for peer ${peerId} - channel not ready`);
        if (!this.messageQueue.has(peerId)) {
          this.messageQueue.set(peerId, []);
        }
        this.messageQueue.get(peerId).push({ message, resolve, reject });
        return;
      }

      try {
        this.trace(`Sending message to ${peerId}`, { structured: message });
        dataChannel.send(JSON.stringify(message));
        resolve();
      } catch (error) {
        this.trace.error(`Error sending message to ${peerId}:`, error);
        reject(error);
      }
    });
  }

  broadcast(message, except = null) {
    this.trace(`Broadcasting message to ${this.dataChannels.size} peers`, {
      structured: {
        message,
        excludedPeer: except
      }
    });
    
    return Promise.all(
      Array.from(this.dataChannels.entries())
        .filter(([peerId]) => !except || peerId !== except)
        .map(([peerId]) => this.send(peerId, message))
    );
  }
}