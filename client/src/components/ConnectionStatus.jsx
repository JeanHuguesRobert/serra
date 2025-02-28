import React, { useEffect, useState } from 'react';
import { connectionStatusService } from '@serra/core';

const ConnectionStatus = () => {
    const [connectionState, setConnectionState] = useState(connectionStatusService.getConnectionState());

    useEffect(() => {
        const handler = (state) => {
            setConnectionState(state);
        };
        
        connectionStatusService.on('statusChange', handler);
        return () => connectionStatusService.off('statusChange', handler);
    }, []);

    const getLEDStyle = () => {
        let color = 'red'; // default: disconnected
        
        if (connectionState.isConnecting) {
            color = 'orange'; // connecting
        } else if (connectionState.isConnected) {
            color = 'green'; // connected
        }
        
        return {
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: color,
            display: 'inline-block',
            marginRight: '8px',
            boxShadow: `0 0 8px ${color}`,
            transition: 'background-color 0.3s ease'
        };
    };

    const getStatusText = () => {
        if (connectionState.isConnecting) return 'Connecting...';
        if (connectionState.isConnected) return 'Connected';
        return 'Disconnected';
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            borderRadius: '4px',
            backgroundColor: '#f5f5f5',
            border: '1px solid #e0e0e0',
            fontSize: '14px',
            fontWeight: 500
        }}>
            <div style={getLEDStyle()} />
            <span>{getStatusText()}</span>
        </div>
    );
};

export default ConnectionStatus;