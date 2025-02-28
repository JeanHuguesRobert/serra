import React from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import SaveIcon from '@mui/icons-material/Save';
import ListIcon from '@mui/icons-material/List';

const BurgerMenu = ({ anchorEl, onClose, onSendMessage }) => {
  const handleCommand = (command) => {
    onSendMessage({ text: command, type: 'user' });
    onClose();
  };

  const commands = [
    { text: '/start', icon: <PlayArrowIcon />, label: 'Start Engine' },
    { text: '/stop', icon: <StopIcon />, label: 'Stop Engine' },
    { text: '/ls', icon: <ListIcon />, label: 'List Elements' },
    { text: '/save', icon: <SaveIcon />, label: 'Save Dashboard' },
  ];

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
    >
      {commands.map(({ text, icon, label }) => (
        <MenuItem key={text} onClick={() => handleCommand(text)}>
          <ListItemIcon>{icon}</ListItemIcon>
          <ListItemText>{label}</ListItemText>
        </MenuItem>
      ))}
    </Menu>
  );
};

export default BurgerMenu;