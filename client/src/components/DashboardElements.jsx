import React, { useEffect, useState } from 'react';
import { Typography, TextField, Box, Button, Switch, Alert } from '@mui/material';

const DashboardElements = ({ engine }) => {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    if (!engine) return;
    
    const subscription = engine.getStateObservable().subscribe(state => {
      setElements(state.elements || []);
    });

    return () => subscription.unsubscribe();
  }, [engine]);

  const handleInputChange = (elementId, value) => {
    engine.updateElement(elementId, 'value', value);
  };

  const renderElement = (element) => {
    switch (element.type) {
      case 'number':
        return (
          <Box key={element.id} sx={{ mb: 2 }}>
            <Typography variant="subtitle1">{element.properties?.label || element.id}</Typography>
            <TextField
              type="number"
              value={element.value || ''}
              onChange={(e) => handleInputChange(element.id, parseFloat(e.target.value))}
              variant="outlined"
              size="small"
              fullWidth
            />
          </Box>
        );

      case 'formula':
        return (
          <Box key={element.id} sx={{ mb: 2 }}>
            <Typography variant="subtitle1">{element.properties?.label || element.id}</Typography>
            <Typography>{element.value}</Typography>
          </Box>
        );

      case 'display':
        return (
          <Box key={element.id} sx={{ mb: 2 }}>
            <Typography variant="subtitle1">{element.properties?.label || element.id}</Typography>
            <Typography>{element.value}</Typography>
          </Box>
        );

      case 'button':
        return (
          <Box key={element.id} sx={{ mb: 2 }}>
            <Button
              variant={element.properties?.variant || 'contained'}
              color={element.properties?.color || 'primary'}
              onClick={() => {
                if (element.properties?.action) {
                  engine.updateElement(element.id, 'clicked', true);
                }
              }}
            >
              {element.properties?.label || element.id}
            </Button>
          </Box>
        );

      case 'switch':
        return (
          <Box key={element.id} sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <Typography>{element.properties?.label || element.id}</Typography>
            <Switch
              checked={Boolean(element.value)}
              onChange={(e) => handleInputChange(element.id, e.target.checked)}
            />
          </Box>
        );

      case 'alert':
        return (
          <Box key={element.id} sx={{ mb: 2 }}>
            <Alert severity={element.properties?.severity || 'info'}>
              {element.properties?.message || 'Alert message'}
            </Alert>
          </Box>
        );

      default:
        return (
          <Box key={element.id} sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Unknown element type: {element.type}</Typography>
            <Typography variant="body2">ID: {element.id}</Typography>
            <Typography variant="body2">Value: {element.value}</Typography>
          </Box>
        );
    }
  };

  return (
    <div>
      {elements.map(renderElement)}
    </div>
  );
};

export default DashboardElements;
