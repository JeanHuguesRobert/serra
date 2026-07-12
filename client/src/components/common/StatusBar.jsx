import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { StatusLed } from './StatusLed';

export const StatusBar = ({
    connectionStatus,
    connectionTooltip,
    isConnectionBlinking,
    onConnectionToggle,
    engineStatus,
    engineTooltip,
    isEngineBlinking,
    onEngineToggle
}) => {
    console.log('[StatusBar] Rendering with props:', {
        connectionStatus,
        engineStatus,
        isConnectionBlinking,
        isEngineBlinking
    });

    const handleConnectionToggle = () => {
        console.log('[StatusBar] Connection toggle clicked, current status:', connectionStatus);
        onConnectionToggle?.();
    };

    const handleEngineToggle = () => {
        console.log('[StatusBar] Engine toggle clicked, current status:', engineStatus);
        onEngineToggle?.();
    };

    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            padding: 2,
            borderRadius: 1,
            bgcolor: 'background.paper',
            boxShadow: 1,
            gap: 3
        }}>
            <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StatusLed
                        status={connectionStatus}
                        title={connectionTooltip}
                        isBlinking={isConnectionBlinking}
                        onClick={handleConnectionToggle}
                    />
                </Box>
            </Stack>

            <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StatusLed
                        status={engineStatus}
                        title={engineTooltip}
                        isBlinking={isEngineBlinking}
                        onClick={handleEngineToggle}
                    />
                </Box>
            </Stack>
        </Box>
    );
};

export default StatusBar;