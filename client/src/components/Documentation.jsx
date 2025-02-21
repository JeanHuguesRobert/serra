import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, Divider, CircularProgress } from '@mui/material';
import Dashboard from './Dashboard';
import { socket } from '../socket';
import { useDashboard } from '../contexts/DashboardContext';
import { DocumentationService } from '../services/DocumentationService';
import { SocketService } from '../services/SocketService';
import { Box, Typography, List, ListItem, Divider } from '@mui/material';
import { Typography, Box, List, ListItem, Divider } from '@mui/material';
import { Typography, Box, List, ListItem, Divider } from '@mui/material';
import { Typography, Box, List, ListItem, Divider } from '@mui/material';
import { Typography, Box, List, ListItem, Divider } from '@mui/material';

// Rename the constant to DOCUMENTATION_CONCEPTS to avoid conflict
const DOCUMENTATION_CONCEPTS = {
  elements: {
    title: 'Elements',
    description: 'Building blocks of Serra dashboards:',
    items: [
      {
        name: 'Dashboard',
        description: 'A container that can hold other elements and scripts'
      },
      {
        name: 'Display',
        description: 'Shows values and can be updated dynamically'
      },
      {
        name: 'Number',
        description: 'Displays numerical values with optional formatting and units'
      },
      {
        name: 'Dashboard Link',
        description: 'Navigation element to load other dashboards'
      }
    ]
  },
  scripts: {
    title: 'Scripts',
    description: 'Dynamic behaviors and interactions:',
    items: [
      {
        name: 'Element Access',
        description: 'Scripts can access elements by their IDs'
      },
      {
        name: 'Socket Communication',
        description: 'Real-time updates through WebSocket'
      }
    ]
  }
};

function Documentation() {
  const { current: docDashboard } = useDashboard();
  const concepts = DocumentationService.getConcepts();

  useEffect(() => {
    SocketService.requestDashboard(socket, 'documentation');
  }, []);

  const renderConcepts = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom>Concepts</Typography>
      {Object.entries(concepts).map(([key, section]) => (
        <Box key={key} sx={{ mb: 2 }}>
          <Typography variant="h6">{section.title}</Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {section.description}
          </Typography>
          {section.items.map((item, index) => (
            <Box key={index} sx={{ ml: 2, mb: 1 }}>
              <Typography variant="subtitle2">{item.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {item.description}
              </Typography>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
  return (
    <Box>
      <Typography variant="h6" gutterBottom>Documentation</Typography>
      {Object.entries(DOCUMENTATION_CONCEPTS).map(([key, section]) => (
        <Box key={key} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>{section.title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {section.description}
          </Typography>
          <List dense>
            {section.items.map((item, index) => (
              <ListItem key={index}>
                <Box>
                  <Typography variant="subtitle2">{item.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
          {key !== Object.keys(DOCUMENTATION_CONCEPTS).slice(-1)[0] && <Divider sx={{ my: 2 }} />}
        </Box>
      ))}
    </Box>
  );
}

export default Documentation;