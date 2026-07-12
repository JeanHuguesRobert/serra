import React, { useState, useCallback, useMemo } from 'react';
import { Box, TextField, IconButton, Paper, Button } from '@mui/material';
import { Send as SendIcon, Power as PowerIcon, Refresh as RefreshIcon } from '@mui/icons-material';

const StatusLed = ({ active, label, onAction, actionIcon: ActionIcon, actionLabel }) => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    mr: 2 
  }}>
    <Box sx={{
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: active ? '#4caf50' : '#ff5252',
      mr: 1
    }} />
    <span style={{ fontSize: '0.75rem', mr: 1 }}>{label}</span>
    {onAction && (
      <IconButton 
        size="small" 
        onClick={onAction}
        title={actionLabel}
        sx={{ ml: 0.5 }}
      >
        <ActionIcon fontSize="small" />
      </IconButton>
    )}
  </Box>
);

const ChatInterface = ({ messages, onSendMessage, serverConnected, engineRunning, onEngineToggle, onReconnect }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    
    if (!message?.trim()) return;

    const userMessage = {
      text: message,
      type: 'user'
    };

    console.log('[Chat] Sending message:', userMessage);
    onSendMessage(userMessage);
    setMessage('');
  }, [message, onSendMessage]);

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 1, 
        borderBottom: '1px solid rgba(0,0,0,0.12)' 
      }}>
        <StatusLed 
          active={serverConnected} 
          label="Server" 
          onAction={onReconnect}
          actionIcon={RefreshIcon}
          actionLabel="Reconnect"
        />
        <StatusLed 
          active={engineRunning} 
          label="Engine"
          onAction={onEngineToggle}
          actionIcon={PowerIcon}
          actionLabel={engineRunning ? "Stop Engine" : "Start Engine"}
        />
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        {messages.map((msg, idx) => (
          <Box key={idx} sx={{ mb: 1 }}>
            <Paper elevation={1} sx={{ p: 1 }}>
              {msg.text}
            </Paper>
          </Box>
        ))}
      </Box>
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
        <TextField
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          InputProps={{
            endAdornment: (
              <IconButton type="submit">
                <SendIcon />
              </IconButton>
            )
          }}
        />
      </Box>
    </Box>
  );
};

export default ChatInterface;