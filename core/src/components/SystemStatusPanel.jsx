import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useSocket } from '../../socket/SocketContext';
import { useContext } from 'react';
import { EngineContext } from '../../context/EngineContext';
import { StatusBar } from './common/StatusBar';
import { ActionList } from './common/ActionList';
import { ActiveStateManager } from '../ActiveState';

const SystemStatusPanel = () => {
    const socket = useSocket();
    const { engine } = useContext(EngineContext);
    
    const connectionStateManager = new ActiveStateManager({
        initialState: {
            current: socket?.connected ? 'connected' : 'disconnected',
            desired: 'up',
            transitioning: false
        }
    });

    const engineStateManager = new ActiveStateManager({
        initialState: {
            current: engine?.state?.isRunning ? 'running' : 'stopped',
            desired: 'running',
            transitioning: engine?.state?.isTransitioning || false
        }
    });

    useEffect(() => {
        if (!socket) return;

        const handleConnect = () => {
            connectionStateManager.updateState({
                current: 'connected',
                transitioning: false
            });
        };

        const handleDisconnect = () => {
            connectionStateManager.updateState({
                current: 'disconnected',
                transitioning: false
            });
        };

        const handleConnecting = () => {
            connectionStateManager.updateState({ transitioning: true });
        };

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('reconnect_attempt', handleConnecting);
        socket.on('disconnecting', handleConnecting);

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('reconnect_attempt', handleConnecting);
            socket.off('disconnecting', handleConnecting);
        };
    }, [socket]);

    useEffect(() => {
        if (!engine) return;

        const handleEngineStateChange = () => {
            engineStateManager.updateState({
                current: engine.state.isRunning ? 'running' : 'stopped',
                transitioning: engine.state.isTransitioning
            });
        };

        engine.on('stateChange', handleEngineStateChange);
        return () => engine.off('stateChange', handleEngineStateChange);
    }, [engine]);

    const handleEngineToggle = () => {
        const newDesiredState = engineStateManager.getState().desired === 'running' ? 'stopped' : 'running';
        engineStateManager.updateState({ desired: newDesiredState });

        if (engine) {
            if (newDesiredState === 'running') {
                engine.start();
            } else {
                engine.stop();
            }
        }
    };

    const handleConnectionStateToggle = () => {
        const newState = connectionStateManager.getState().desired === 'up' ? 'down' : 'up';
        connectionStateManager.updateState({ desired: newState });

        if (socket) {
            if (newState === 'down') {
                socket.disconnect();
            } else {
                socket.connect();
            }
        }
    };

    const handleSelectDashboard = () => {
        console.log('Select dashboard clicked');
    };

    return (
        <Box>
            <StatusBar
                connectionStatus={connectionStateManager.getState().current}
                connectionTooltip={connectionStateManager.getState().current.charAt(0).toUpperCase() + 
                                 connectionStateManager.getState().current.slice(1)}
                isConnectionBlinking={connectionStateManager.getState().transitioning}
                onConnectionToggle={handleConnectionStateToggle}
                engineStatus={engineStateManager.getState().current}
                engineTooltip={engineStateManager.getState().current.charAt(0).toUpperCase() + 
                              engineStateManager.getState().current.slice(1)}
                isEngineBlinking={engineStateManager.getState().transitioning}
                onEngineToggle={handleEngineToggle}
            />
            <ActionList onSelectDashboard={handleSelectDashboard} />
        </Box>
    );
};

export default SystemStatusPanel;