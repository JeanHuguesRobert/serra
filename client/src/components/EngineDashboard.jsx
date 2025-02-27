import React from 'react';
import { Box, Typography } from '@mui/material';
import { useEngineStatus } from '../hooks/useEngineStatus';

function EngineDashboard() {
  const { running, timestamp } = useEngineStatus();

  return (
    <Box>
      <Typography variant="h6">Engine Dashboard</Typography>
      <Typography>
        Status: {running ? 'Running' : 'Stopped'}
      </Typography>
      <Typography variant="caption">
        Last update: {timestamp}
      </Typography>
    </Box>
  );
}

export default EngineDashboard;
