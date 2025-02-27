import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';
import { useEngine } from '../contexts/EngineContext';

/**
 * Component for creating and managing formulas in the engine
 */
const EngineFormula = ({ dashboardId }) => {
  const { engine, isReady } = useEngine();
  const [formulaId, setFormulaId] = useState('');
  const [computeExpression, setComputeExpression] = useState('');
  const [inputElements, setInputElements] = useState('');
  const [targetElement, setTargetElement] = useState('');
  const [message, setMessage] = useState('');
  
  const handleCreateFormula = () => {
    if (!isReady || !engine) {
      setMessage('Engine not ready');
      return;
    }
    
    try {
      engine.setCurrentDashboard(dashboardId);
      
      const formula = engine.createFormula(formulaId);
      const inputs = inputElements.split(',').map(id => id.trim());
      
      formula.addComputation(targetElement, {
        inputs,
        compute: `return ${computeExpression};`
      });
      
      setMessage(`Formula created: ${formulaId}`);
      
      // Reset form
      setFormulaId('');
      setComputeExpression('');
      setInputElements('');
      setTargetElement('');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Create Formula</Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Formula ID"
          value={formulaId}
          onChange={(e) => setFormulaId(e.target.value)}
          fullWidth
        />
        
        <TextField
          label="Input Elements (comma-separated)"
          value={inputElements}
          onChange={(e) => setInputElements(e.target.value)}
          helperText="Example: element1,element2"
          fullWidth
        />
        
        <TextField
          label="Target Element"
          value={targetElement}
          onChange={(e) => setTargetElement(e.target.value)}
          fullWidth
        />
        
        <TextField
          label="Compute Expression"
          value={computeExpression}
          onChange={(e) => setComputeExpression(e.target.value)}
          helperText="Example: a + b (without 'return')"
          fullWidth
          multiline
          rows={2}
        />
        
        <Button 
          variant="contained" 
          onClick={handleCreateFormula}
          disabled={!isReady || !formulaId || !targetElement || !computeExpression}
        >
          Create Formula
        </Button>
        
        {message && (
          <Typography 
            color={message.startsWith('Error') ? 'error' : 'success'}
            variant="body2"
          >
            {message}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default EngineFormula;
