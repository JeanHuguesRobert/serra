import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { socket } from '../socket';
import { useSocket } from '../hooks/useSocket';

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const requestsRef = useRef({
    active: false,
    id: null,
    timeout: null,
    timestamp: null,
    connectionId: null
  });

  const requestDashboard = useCallback((id) => {
    // Don't request if same dashboard and connection
    if (requestsRef.current.active && 
        requestsRef.current.id === id && 
        requestsRef.current.connectionId === socket.socket?.id) {
      console.log('[Dashboard] Skipping duplicate request:', id);
      return;
    }

    // Clear existing request state
    if (requestsRef.current.timeout) {
      clearTimeout(requestsRef.current.timeout);
    }

    console.log('[Dashboard] Requesting dashboard:', id, 'on connection:', socket.socket?.id);
    setLoading(true);
    requestsRef.current = {
      active: true,
      id,
      connectionId: socket.socket?.id,
      timestamp: Date.now(),
      timeout: setTimeout(() => {
        console.log('[Dashboard] Request timed out for:', id);
        requestsRef.current.active = false;
        setLoading(false);
      }, 5000)
    };

    socket.emit('request-dashboard', id);
  }, []);

  const handleConnect = () => {
    requestsRef.current = {
      active: false,
      id: null,
      connectionId: null,
      timestamp: null,
      timeout: null
    };
  };

  const handleDashboardUpdate = (updatedDashboard) => {
    console.log('[Dashboard] Received update for:', updatedDashboard.id);
    setDashboard(updatedDashboard);
    setLoading(false);
    requestsRef.current.active = false;
    
    if (requestsRef.current.timeout) {
      clearTimeout(requestsRef.current.timeout);
    }
  };

  const handleSocketEvents = useMemo(() => ({
    'connect': handleConnect,
    'dashboard:update': handleDashboardUpdate
  }), [handleConnect, handleDashboardUpdate]);

  useSocket(handleSocketEvents);

  useEffect(() => {
    // Only request initial dashboard if we don't have one
    if (!dashboard && !requestsRef.current.active) {
      requestDashboard('first');
    }
  }, [dashboard, requestDashboard]);

  const updateDashboard = (newDashboard) => {
    setDashboard(newDashboard);
    socket.emit('dashboard:update', newDashboard);
  };

  const value = {
    dashboard,
    loading,
    updateDashboard,
    setLoading,
    requestDashboard
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}