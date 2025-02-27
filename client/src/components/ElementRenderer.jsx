import React from 'react';
import { Typography, Button } from '@mui/material';
import { useDashboard } from '../contexts/DashboardContext';
import Dashboard from './Dashboard';
import { ElementService } from '../services/ElementService';
import { useEngine, useRenderElement } from '../contexts/EngineContext';

function ElementRenderer({ element, dashboardId }) {
  const { pushDashboard } = useDashboard();
  const { engine, isReady } = useEngine();
  const renderElement = useRenderElement();

  if (!ElementService.validateElement(element)) {
    return null;
  }

  if (isReady && engine) {
    const engineElement = engine.getElement(element.id);
    if (engineElement) {
      return renderElement(engineElement, { dashboardId });
    }
  }

  switch (element.type) {
    case 'display':
      return (
        <div key={`${dashboardId}-${element.id}`} className="display-container">
          <Typography variant="subtitle1">{element.label}</Typography>
          <div id={element.id} className={element.className}>
            {ElementService.processDisplayValue(element, element.value)}
            {element.components?.map(comp => (
              <ElementRenderer 
                key={comp.id} 
                element={comp} 
                dashboardId={dashboardId} 
              />
            ))}
          </div>
        </div>
      );
    // ... rest of the element rendering cases
    default:
      return null;
  }
}

export default ElementRenderer;