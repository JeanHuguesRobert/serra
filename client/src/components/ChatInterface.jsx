import React, { useState, useCallback, useMemo } from 'react';
import { Box, TextField, IconButton, Paper, Button } from '@mui/material';
import { Send as SendIcon, Power as PowerIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useSocket } from '../hooks/useSocket';
import { SOCKET_EVENTS } from '../../../core/src/constants/events.js';
import { socket } from '../socket/socket.js';
import { useEngine } from '../contexts/EngineContext';

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

const ChatInterface = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [serverConnected, setServerConnected] = useState(false);
  const { engine } = useEngine();

  const handleSocketEvents = useMemo(() => ({
    'connect': () => setServerConnected(true),
    'disconnect': () => setServerConnected(false),
    [SOCKET_EVENTS.CHAT.RESPONSE]: (response) => {
      console.log('[Chat] Received response:', response);
      setMessages(prev => [...prev, { 
        text: response?.text || 'No response',
        type: 'response' 
      }]);
    },
    [SOCKET_EVENTS.CHAT.WELCOME]: (msg) => {
      console.log('[Chat] Processing welcome:', msg);
      // Handle both message formats
      const welcomeText = msg?.text || msg?.message || 'Welcome! Type /? for help';
      setMessages(prev => {
        // Only add if no messages or if last message isn't welcome
        if (prev.length === 0 || prev[prev.length - 1].type !== 'system') {
          console.log('[Chat] Adding welcome message:', welcomeText);
          return [...prev, { 
            text: welcomeText,
            type: 'system' 
          }];
        }
        return prev;
      });
    },
    [SOCKET_EVENTS.CHAT.HELP]: (help) => {
      console.log('[Chat] Received help:', help);
      setMessages(prev => [...prev, { 
        text: help?.text || 'Available commands:\n/? - Show this help',
        type: 'system' 
      }]);
    }
  }), []); // Remove messages.length dependency since we handle it inside

  useSocket(handleSocketEvents);

  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    
    if (!message?.trim()) return;

    const userMessage = {
      text: message,
      type: 'user'
    };

    console.log('[Chat] Sending message:', userMessage);
    socket.emit(SOCKET_EVENTS.CHAT.MESSAGE, userMessage);
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
  }, [message]);

  const handleReconnect = useCallback(() => {
    socket.connect();
  }, []);

  const handleEngineToggle = useCallback(() => {
    if (engine?.running) {
      engine.stop();
    } else {
      engine.start();
    }
  }, [engine]);

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
          onAction={handleReconnect}
          actionIcon={RefreshIcon}
          actionLabel="Reconnect"
        />
        <StatusLed 
          active={engine?.running} 
          label="Engine"
          onAction={handleEngineToggle}
          actionIcon={PowerIcon}
          actionLabel={engine?.running ? "Stop Engine" : "Start Engine"}
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