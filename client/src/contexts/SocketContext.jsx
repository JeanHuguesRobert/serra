import React, { createContext, useContext, useEffect, useState } from 'react';
import BrowserWebSocketTransport from '../services/BrowserWebSocketTransport';
import { connectionStatusService } from '@serra/core';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [transport, setTransport] = useState(null);
  const [connectionState, setConnectionState] = useState(connectionStatusService.getConnectionState());
  const [engineState, setEngineState] = useState({ isRunning: false });

  useEffect(() => {
    const wsTransport = new BrowserWebSocketTransport({
      url: 'http://localhost:5000',
      protocols: ['serra', 'mcp']
    });

    wsTransport.on('connection', () => {
      console.log('[SocketProvider] WebSocket connected');
    });

    wsTransport.on('disconnection', ({ reason }) => {
      console.log('[SocketProvider] WebSocket disconnected:', reason);
    });

    wsTransport.on('error', ({ error }) => {
      console.error('[SocketProvider] WebSocket error:', error);
    });

    wsTransport.on('message', (message) => {
      if (message.type === 'engineState') {
        setEngineState(message.data);
      }
    });

    // Connect to server
    wsTransport.connect().catch(error => {
      console.error('[SocketProvider] Connection error:', error);
    });

    setTransport(wsTransport);

    // Cleanup on unmount
    return () => {
      wsTransport.disconnect();
    };
  }, []);

  // Listen for connection status changes
  useEffect(() => {
    const handleStatusChange = (state) => {
      setConnectionState(state);
    };
    
    connectionStatusService.on('statusChange', handleStatusChange);
    return () => connectionStatusService.off('statusChange', handleStatusChange);
  }, []);

  const contextValue = {
    transport,
    connectionState,
    engineState,
    isConnected: () => transport?.isConnected() || false,
    send: (message, options) => transport?.send(message, options),
    join: (room) => transport?.join(room),
    leave: (room) => transport?.leave(room),
  };

  if (!transport) {
    return <div>Connecting to server...</div>;
  }

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};