import React from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SaveIcon from '@mui/icons-material/Save';
import { useDispatch } from 'react-redux';
import { socket } from '../socket';

function BurgerMenu({ anchorEl, onClose }) {
  const dispatch = useDispatch();

  const handleCreateDashboard = () => {
    socket.emit('create-dashboard');
    onClose();
  };

  const handleOpenDashboard = () => {
    socket.emit('open-dashboard');
    onClose();
  };

  const handleSaveDashboard = () => {
    socket.emit('save-dashboard');
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      <MenuItem onClick={handleCreateDashboard}>
        <ListItemIcon>
          <AddIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>New Dashboard</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleOpenDashboard}>
        <ListItemIcon>
          <FolderOpenIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Open Dashboard</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleSaveDashboard}>
        <ListItemIcon>
          <SaveIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Save Dashboard</ListItemText>
      </MenuItem>
    </Menu>
  );
}

export default BurgerMenu;