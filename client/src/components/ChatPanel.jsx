import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Paper, Typography, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useSocket } from '../contexts/SocketContext';

const ChatPanel = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const socket = useSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on('chat-message', handleMessage);

    return () => {
      socket.off('chat-message', handleMessage);
    };
  }, [socket]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;

    const message = {
      type: 'user',
      text: input,
      messageId: Date.now().toString()
    };

    socket.emit('chat-message', message);
    setMessages((prev) => [...prev, message]);
    setInput('');
  };

  return (
    <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {messages.map((message) => (
          <Box
            key={message.messageId}
            sx={{
              display: 'flex',
              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
              mb: 2
            }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 1,
                backgroundColor: message.type === 'user' ? '#e3f2fd' : '#f5f5f5',
                maxWidth: '70%'
              }}
            >
              <Typography variant="body1">{message.text}</Typography>
            </Paper>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>
      <Box component="form" onSubmit={handleSend} sx={{ p: 2, backgroundColor: 'background.default' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            variant="outlined"
          />
          <IconButton type="submit" color="primary" disabled={!input.trim()}>
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default ChatPanel;