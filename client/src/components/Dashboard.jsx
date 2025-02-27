import React, { useEffect, useState } from 'react';
import { Paper } from '@mui/material';
import { useEngine } from '../contexts/EngineContext';
import DashboardElements from './DashboardElements';

function Dashboard() {
  const { engine, isReady } = useEngine();

  useEffect(() => {
    if (!isReady || !engine) return;

    // Create formula element
    const formula = engine.createFormula('formula');
    formula.setProperty('label', 'Formula');
    formula.setProperty('value', 'X = A + B');

    // Create inputs
    const inputX = engine.createElement('input-x', 'number');
    inputX.setProperty('label', 'X');
    inputX.setProperty('value', 8);

    const inputA = engine.createElement('input-a', 'number');
    inputA.setProperty('label', 'A');
    inputA.setProperty('value', 5);

    const inputB = engine.createElement('input-b', 'number');
    inputB.setProperty('label', 'B');
    inputB.setProperty('value', 3);

    // Setup formula computations
    formula.addComputations({
      'X': {
        inputs: ['input-a', 'input-b'],
        compute: '(a, b) => a + b',
        output: 'input-x'
      },
      'A': {
        inputs: ['input-x', 'input-b'],
        compute: '(x, b) => x - b',
        output: 'input-a'
      },
      'B': {
        inputs: ['input-x', 'input-a'],
        compute: '(x, a) => x - a',
        output: 'input-b'
      }
    });
  }, [engine, isReady]);

  return (
    <Paper elevation={3} style={{ padding: '20px', margin: '20px' }}>
      {isReady && <DashboardElements />}
    </Paper>
  );
}

export default Dashboard;
