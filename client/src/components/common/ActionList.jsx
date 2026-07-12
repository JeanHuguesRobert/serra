import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Dashboard } from '@mui/icons-material';

const ActionList = ({ onSelectDashboard }) => {
    return (
        <Box sx={{
            width: '100%',
            maxWidth: 360,
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 1,
            mt: 2
        }}>
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={onSelectDashboard}>
                        <ListItemIcon>
                            <Dashboard />
                        </ListItemIcon>
                        <ListItemText primary="Select Dashboard" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );
};

export { ActionList };