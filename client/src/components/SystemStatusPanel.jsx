import React, { useEffect } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { PowerSettingsNew, Cloud, CloudOff, PlayArrow, Stop } from '@mui/icons-material';
import { useSocket } from '../contexts/SocketContext';
import { useContext } from 'react';
import { EngineContext } from '../contexts/EngineContext';
import { StatusBar } from './common/StatusBar';
import { ActionList } from './common/ActionList';
import { StateWrapper } from './StateWrapper';
import useActiveState from '../hooks/useActiveState';

const SystemStatusPanel = () => {
    const socket = useSocket();
    const { engine } = useContext(EngineContext);
    
    const connectionStateManager = useActiveState({
        isConnected: socket?.connected || false,
        isConnecting: false
    });
    
    const engineStateManager = useActiveState({
        isRunning: false,
        isTransitioning: false
    });
    
    const { state: connectionState, setState: setConnectionState } = connectionStateManager;
    const { state: engineState, setState: setEngineState } = engineStateManager;
    
    const [desiredConnectionState, setDesiredConnectionState] = React.useState('up');
    const [desiredEngineState, setDesiredEngineState] = React.useState('stopped');

    useEffect(() => {
        if (!socket) return;

        const handleConnect = () => {
            setConnectionState(prev => ({ ...prev, isConnected: true, isConnecting: false }));
        };

        const handleDisconnect = () => {
            setConnectionState(prev => ({ ...prev, isConnected: false, isConnecting: false }));
        };

        const handleConnecting = () => {
            setConnectionState(prev => ({ ...prev, isConnecting: true }));
        };

        const handleDisconnecting = () => {
            setConnectionState(prev => ({ ...prev, isConnecting: true }));
        };

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('reconnect_attempt', handleConnecting);
        socket.on('disconnecting', handleDisconnecting);

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('reconnect_attempt', handleConnecting);
            socket.off('disconnecting', handleDisconnecting);
        };
    }, [socket]);
    
    console.log('[SystemStatusPanel] Engine context value:', { engine });

    useEffect(() => {
        console.log('[SystemStatusPanel] Engine dependency changed:', { engine });
        
        console.assert( engine, 'Engine is undefined' );
        if (engine) {
            const isRunning = engine.state?.isRunning || false;
            const isTransitioning = engine.state?.isTransitioning || false;
            console.log('[SystemStatusPanel] Engine state updated:', { isRunning, isTransitioning });
            setEngineState({ isRunning, isTransitioning });
        } else {
            console.log('[SystemStatusPanel] Engine is undefined');
        }
    }, [engine]);
    
    const getConnectionStatus = () => {
        if (connectionState.isConnecting) return 'connecting';
        return connectionState.isConnected ? 'connected' : 'disconnected';
    };
    
    const getEngineStatus = () => {
        console.assert( engine, 'Engine is undefined' );
        console.assert( engine.getRunningStatus, 'Engine does not have getRunningStatus method', engine );
        return engine.getRunningStatus();
    };
    
    const getEngineTooltip = () => {
        console.assert( engine, 'Engine is undefined' );
        const status = engine.getRunningStatus();
        return status.charAt(0).toUpperCase() + status.slice(1);
    };
    
    const getConnectionTooltip = () => {
        if (connectionState.isConnecting && desiredConnectionState === 'up') return 'Connecting';
        if (connectionState.isConnecting && desiredConnectionState === 'down') return 'Disconnecting';
        if (connectionState.isConnected) return 'Connected';
        return 'Disconnected';
    };
    
    const handleEngineToggle = () => {
        console.log('[SystemStatusPanel] Engine toggle requested, current engine:', { engine });
        const newDesiredState = desiredEngineState === 'running' ? 'stopped' : 'running';
        setDesiredEngineState(newDesiredState);
        if (engine) {
            console.log('[SystemStatusPanel] Executing engine state change:', { newDesiredState });
            if (newDesiredState === 'running') {
                engine.start();
            } else {
                engine.stop();
            }
        } else {
            console.warn('[SystemStatusPanel] Cannot toggle engine - engine is undefined');
        }
    };
    
    const handleConnectionStateToggle = () => {
        console.log('[SystemStatusPanel] Connection state toggle requested');
        const newState = desiredConnectionState === 'up' ? 'down' : 'up';
        setDesiredConnectionState(newState);
        if (newState === 'down' && socket) {
            socket.disconnect();
        } else if (newState === 'up' && socket) {
            socket.connect();
        }
    };

    const handleSelectDashboard = () => {
        console.log('Select dashboard clicked');
    };
    
    return (
        <Box>
            <StatusBar
                connectionStatus={getConnectionStatus()}
                connectionTooltip={getConnectionTooltip()}
                isConnectionBlinking={connectionState.isConnecting}
                onConnectionToggle={handleConnectionStateToggle}
                engineStatus={getEngineStatus()}
                engineTooltip={getEngineTooltip()}
                isEngineBlinking={engineState.isTransitioning}
                onEngineToggle={handleEngineToggle}
            />
            <ActionList onSelectDashboard={handleSelectDashboard} />
        </Box>
    );
};

export default SystemStatusPanel;

/*
 * @fileoverview SystemStatusPanel Component
 *
 * A comprehensive system status management interface that handles both connection
 * and engine states, along with system actions. This component provides visual
 * indicators and controls for system connectivity and engine operation.
 *
 * @version 1.0.0
 * @state stable
 *
 * @requires @serra/core
 * @requires @mui/material
 * @requires @mui/icons-material
 *
 * @context UI Component
 * @patterns Observer Pattern, State Pattern
 *
 * Main functionalities:
 * - Connection state management and visualization
 * - Engine state control and status display
 * - System action interface
 * - Real-time status updates
 *
 * @statePattern Uses local state for UI updates and external state service for system status
 */