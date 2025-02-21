import React, { memo, useEffect, useRef } from 'react';
import { Typography, Button, Box, TextField } from '@mui/material';
import { ComponentTypes } from './ComponentTypes';
import { ComponentFactory } from '../factories/ComponentFactory';

const DashboardComponents = memo(({ engine }) => {
  const subscriptionsRef = useRef(new Map());

  const handleComponentUpdate = (component, value) => {
    const element = document.getElementById(component.id);
    if (!element) return;

    switch (component.type) {
      case ComponentTypes.DISPLAY:
        element.textContent = value;
        break;
      case ComponentTypes.INPUT:
        element.value = value;
        break;
    }
  };

  const handleInputChange = (component, value) => {
    engine.dispatch({
      type: 'UPDATE_VALUE',
      payload: { id: component.id, value }
    });
  };

  useEffect(() => {
    const model = engine.getState();
    if (!model?.components) return;

    const subscriptions = model.components.map(component => 
      engine.observe(`components.${component.id}`).subscribe(value => 
        handleComponentUpdate(component, value)
      )
    );

    subscriptionsRef.current = new Map(
      model.components.map((component, index) => [component.id, subscriptions[index]])
    );

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
      subscriptionsRef.current.clear();
    };
  }, [engine]);

  const renderComponent = (component) => {
    if (!ComponentFactory.validateComponent(component)) {
      console.warn('Invalid component:', component);
      return null;
    }

    const elementId = `${engine.getState().id}-${component.id}`;

    switch (component.type) {
      case ComponentTypes.DISPLAY:
        return (
          <Box key={elementId} className="display-container">
            <Typography variant="subtitle1">{component.label}</Typography>
            <div 
              id={component.id} 
              className={component.className}
              data-component-type={ComponentTypes.DISPLAY}
            />
          </Box>
        );

      case ComponentTypes.DASHBOARD_LINK:
        return (
          <Box key={elementId} className={`dashboard-link-container ${component.className || ''}`}>
            <Button 
              id={component.id}
              variant="contained" 
              color="primary" 
              fullWidth
              data-component-type={ComponentTypes.DASHBOARD_LINK}
              onClick={() => engine.dispatch({
                type: 'NAVIGATE',
                payload: { targetId: component.targetId }
              })}
            >
              {component.label}
            </Button>
          </Box>
        );

      case ComponentTypes.CONTAINER:
        return (
          <Box 
            key={elementId}
            sx={{ 
              display: 'flex',
              flexDirection: component.layout === 'horizontal' ? 'row' : 'column',
              gap: 2
            }}
          >
            {component.components?.map(renderComponent)}
          </Box>
        );

      case ComponentTypes.INPUT:
        return (
          <Box key={elementId} className="input-container">
            <TextField
              id={component.id}
              label={component.label}
              variant="outlined"
              fullWidth
              size="small"
              data-component-type={ComponentTypes.INPUT}
              onChange={(e) => handleInputChange(component, e.target.value)}
            />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-components">
      {engine.getState()?.components?.map(renderComponent)}
    </div>
  );
});

export default DashboardComponents;