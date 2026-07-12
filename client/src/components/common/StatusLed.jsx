import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';

const colors = {
  error: '#ff3d00', // Bright Red Orange
  success: '#4caf50', // Material Green
  warning: '#ffc107', // Amber Yellow
  info: '#2196f3', // Light Blue
  default: '#9e9e9e', // Medium Gray
  disconnected: '#ff3d00', // Bright Red Orange
  connected: '#4caf50', // Material Green
  connecting: '#ffc107', // Amber Yellow
  running: '#4caf50', // Material Green
  stopped: '#ff3d00', // Bright Red Orange
  starting: '#ffc107', // Amber Yellow
  stopping: '#ffc107' // Amber Yellow
};

export function StatusLed({ status, label, onClick, title, isBlinking }) {
  const handleClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    console.log('[StatusLed] Click event triggered with status:', status);
    if (onClick) {
      onClick(status);
    }
  };

  const ledStyle = {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    display: 'inline-block',
    marginRight: '8px',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'background-color 0.3s ease',
    backgroundColor: colors[status] || colors.default,
    animation: isBlinking ? 'blink 1s ease-in-out infinite' : 'none',
    '@keyframes blink': {
      '0%': { opacity: 1 },
      '50%': { opacity: 0.4 },
      '100%': { opacity: 1 }
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Tooltip title={title || status}>
        <Box
          role="button"
          aria-label={`Toggle ${status} state`}
          onClick={handleClick}
          sx={{
            ...ledStyle,
            '&:hover': onClick ? {
              opacity: 0.8,
              transform: 'scale(1.1)',
              transition: 'all 0.2s ease-in-out'
            } : {}
          }}
        />
      </Tooltip>
      {label && (
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      )}
    </Box>
  );
}

export default StatusLed;
