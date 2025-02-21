import React, { useEffect, useState } from 'react';
import { Typography, TextField, Box, Button, Switch, Alert } from '@mui/material';
import { ElementTypes } from '@serra/core';

const DashboardElements = ({ engine }) => {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    const subscription = engine.state$.subscribe(state => {
      setElements(state.elements || []);
    });

    return () => subscription.unsubscribe();
  }, [engine]);

  const handleInputChange = (elementId, value) => {
    engine.dispatch({
      type: 'UPDATE_VALUE',
      payload: { id: elementId, value }
    });
  };

  const renderElement = (element) => {
    switch (element.type) {
      case ElementTypes.NUMBER:
        return (
          <Box key={element.id} sx={{ mb: 2 }}>
            <Typography variant="subtitle1">{element.properties.label}</Typography>
            <TextField
              type="number"
              value={element.properties.value || ''}
              onChange={(e) => handleInputChange(element.id, e.target.value)}
              variant="outlined"
              size="small"
              fullWidth
            />
          </Box>
        );

      case ElementTypes.DISPLAY:
        return (
          <Box key={element.id} sx={{ mb: 2 }}>
            <Typography variant="subtitle1">{element.properties.label}</Typography>
            <Typography>{element.properties.value}</Typography>
          </Box>
        );

      case ElementTypes.INPUT:
        return (
          <Box key={element.id} sx={{ mb: 2 }}>
            <TextField
              label={element.properties.label}
              value={element.properties.value || ''}
              onChange={(e) => handleInputChange(element.id, e.target.value)}
              variant="outlined"
              fullWidth
            />
          </Box>
        );

      case ElementTypes.CONTAINER:
        return (
          <Box 
            key={element.id}
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            {element.children?.map(renderElement)}
          </Box>
        );

      case ElementTypes.BUTTON:
        return (
          <Box key={element.id} sx={{ mb: 2 }}>
            <Button
              variant={element.properties.variant || 'contained'}
              color={element.properties.color || 'primary'}
              onClick={() => engine.dispatch({
                type: 'TRIGGER_ACTION',
                payload: { id: element.id, action: element.properties.action }
              })}
            >
              {element.properties.label}
            </Button>
          </Box>
        );

      case ElementTypes.SWITCH:
        return (
          <Box key={element.id} sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <Typography>{element.properties.label}</Typography>
            <Switch
              checked={element.properties.value || false}
              onChange={(e) => handleInputChange(element.id, e.target.checked)}
            />
          </Box>
        );

      case ElementTypes.ALERT:
        return (
          <Box key={element.id} sx={{ mb: 2 }}>
            <Alert severity={element.properties.severity || 'info'}>
              {element.properties.message}
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {elements.map(renderElement)}
    </div>
  );
};

export default DashboardElements;