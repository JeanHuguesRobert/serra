import React from 'react';
import { Typography, Button } from '@mui/material';
import { socket } from '../socket';
import { useDashboard } from '../contexts/DashboardContext';
import Dashboard from './Dashboard';
import { ElementService } from '../services/ElementService';

function ElementRenderer({ element, dashboardId }) {
  const { pushDashboard } = useDashboard();

  if (!ElementService.validateElement(element)) {
    return null;
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
  }
}