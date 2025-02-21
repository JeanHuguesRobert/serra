import React, { useEffect, useState } from 'react';
import { Paper } from '@mui/material';
import { Engine, ElementTypes } from '@serra/core';
import DashboardElements from './DashboardElements';

function Dashboard() {
  const [engine] = useState(() => new Engine());

  useEffect(() => {
    // Create formula display
    const formula = engine.createElement('formula', ElementTypes.DISPLAY);
    formula.setProperty('label', 'Formula');
    formula.setProperty('value', 'X = A + B');

    // Create inputs for X, A, and B
    const inputX = engine.createElement('input-x', ElementTypes.NUMBER);
    inputX.setProperty('label', 'X');
    inputX.setProperty('value', '8');

    const inputA = engine.createElement('input-a', ElementTypes.NUMBER);
    inputA.setProperty('label', 'A');
    inputA.setProperty('value', '5');

    const inputB = engine.createElement('input-b', ElementTypes.NUMBER);
    inputB.setProperty('label', 'B');
    inputB.setProperty('value', '3');

    // Group everything in a container
    const container = engine.createElement('main-container', ElementTypes.CONTAINER);
    container.addChild(formula);
    container.addChild(inputX);
    container.addChild(inputA);
    container.addChild(inputB);
  }, [engine]);

  return (
    <Paper elevation={3} sx={{ p: 2, minHeight: '400px' }}>
      <DashboardElements engine={engine} />
    </Paper>
  );
}

export default Dashboard;