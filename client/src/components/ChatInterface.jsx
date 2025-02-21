import React, { useState, useRef, useEffect } from 'react';
import { Paper, TextField, Button, Box, Typography } from '@mui/material';
import { socket } from '../socket';
import { ChatService } from '../services/ChatService';
import { SocketService } from '../services/SocketService';
import { Box, TextField, Button, List, ListItem, Typography, Paper } from '@mui/material';
import { Box, Typography, Paper } from '@mui/material';
import { socket } from '../socket';

function ChatInterface() {
  const [message, setMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    const handleConnect = () => {
      setConnectionStatus('connected');
      socket.emit('chat:init');
    };

    const handleDisconnect = () => {
      setConnectionStatus('disconnected');
    };

    const handleError = () => {
      setConnectionStatus('error');
    };

    const handleWelcome = (response) => {
      setMessage(response.message);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleError);
    socket.on('chat:welcome', handleWelcome);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleError);
      socket.off('chat:welcome', handleWelcome);
    };
  }, []);

  const renderStatus = () => {
    switch (connectionStatus) {
      case 'error':
        return <Alert severity="error" sx={{ mb: 2 }}>Connection failed</Alert>;
      case 'disconnected':
        return <Alert severity="warning" sx={{ mb: 2 }}>Disconnected from server</Alert>;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Chat</Typography>
      {renderStatus()}
      <Paper 
        elevation={0} 
        sx={{ 
          height: '300px', 
          mb: 2, 
          p: 2,
          overflow: 'auto',
          backgroundColor: 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography variant="body1" color="text.secondary">
          {message || (connectionStatus === 'connecting' ? 'Connecting...' : 'Waiting for server...')}
        </Typography>
      </Paper>
    </Box>
  );
}

export default ChatInterface;