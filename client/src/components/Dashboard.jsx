import React, { useEffect, useState } from 'react';
import { Paper } from '@mui/material';
import { useEngine } from '../contexts/EngineContext';
import DashboardElements from './DashboardElements';

function Dashboard() {
  const { engine, isReady } = useEngine();

  useEffect(() => {
    if (!isReady || !engine) return;
    
  }, [engine, isReady]);

  return (
    <Paper elevation={3} style={{ padding: '20px', margin: '20px' }}>
      {isReady && <DashboardElements />}
    </Paper>
  );
}

export default Dashboard;
