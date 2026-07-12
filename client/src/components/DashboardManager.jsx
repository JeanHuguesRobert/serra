import React, { useEffect, useState } from 'react';
import { Box, Button, Menu, MenuItem } from '@mui/material';
import { useEngine } from '../contexts/EngineContext';
import DashboardService from '../services/DashboardService';
import Dashboard from './Dashboard';

function DashboardManager() {
  const { engine } = useEngine();
  const [currentDashboard, setCurrentDashboard] = useState(null);
  const [availableDashboards, setAvailableDashboards] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDashboardSelect = (dashboardId) => {
    DashboardService.requestDashboard(dashboardId);
    handleMenuClose();
  };

  useEffect(() => {
    const unsubscribe = DashboardService.subscribe((event, data) => {
      if (event === 'refresh' || event === 'response') {
        setCurrentDashboard(data);
        if (engine) {
          engine.setCurrentDashboard(data.id);
        }
      }
    });

    // Load the 'first' dashboard by default
    DashboardService.requestDashboard('first');

    // Get list of available dashboards
    fetch('http://localhost:5000/api/dashboards')
      .then(response => response.json())
      .then(data => setAvailableDashboards(data))
      .catch(error => console.error('Error loading dashboards:', error));

    return () => {
      unsubscribe();
    };
  }, [engine]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <Button
          variant="outlined"
          onClick={handleMenuClick}
          size="small"
        >
          Select Dashboard
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {availableDashboards.map(dashboard => (
            <MenuItem
              key={dashboard.id}
              onClick={() => handleDashboardSelect(dashboard.id)}
              selected={currentDashboard?.id === dashboard.id}
            >
              {dashboard.title || dashboard.id}
            </MenuItem>
          ))}
        </Menu>
      </Box>
      <Dashboard dashboard={currentDashboard} />
    </Box>
  );
}

export default DashboardManager;