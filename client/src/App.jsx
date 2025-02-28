import React, { useState, useEffect } from 'react';
import { Box, Container, TextField, Paper, IconButton, Tooltip } from '@mui/material';
import { io } from 'socket.io-client';
import { Engine } from '../../core/src/Engine.js';
import { PlayArrow, Stop, List, Add, ShowChart, DeleteOutline, Mic, MicOff, VolumeUp, VolumeOff } from '@mui/icons-material';

let engine = null;
let socket = null;
let recognition = null;
let speechSynthesis = window.speechSynthesis;

function App() {
  const [state, setState] = useState({
    messages: [],
    connected: false,
    actions: [],
    isListening: false,
    isSpeaking: true,
    systemPrompt: '',
    // Add UI context tracking
    context: {
      activeView: null,    // Currently visible section
      selectedElements: [], // Selected dashboard elements
      lastAction: null,    // Last action performed
      screenSize: {        // Viewport information
        width: window.innerWidth,
        height: window.innerHeight
      },
      engineState: null,   // Current engine state
      voiceEnabled: false  // Voice interaction state
    }
  });

  // Track window resizes for context
  useEffect(() => {
    const handleResize = () => {
      setState(s => ({
        ...s,
        context: {
          ...s.context,
          screenSize: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        }
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize voice recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        sendToAI(text);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setState(s => ({ ...s, isListening: false }));
      };
    }
  }, []);

  useEffect(() => {
    if (!socket) {
      socket = io('http://localhost:3000');
      socket.on('connect', () => {
        setState(s => ({ ...s, connected: true }));
        socket.emit('chat:message', { type: 'system', text: 'system:connected' });
      });
    }

    if (!engine) {
      engine = new Engine();
      engine.state$.subscribe(state => socket.emit('engine:state', state));
    }

    socket.on('chat:response', msg => {
      const responseMsg = {
        ...msg,
        role: 'assistant',
        timestamp: new Date().toISOString()
      };
      setState(s => ({
        ...s, 
        messages: [...s.messages, responseMsg],
        // Merge AI suggestions with default actions
        actions: msg.actions ? 
          [...s.actions.slice(0, 3), ...msg.actions] : 
          s.actions
      }));
      
      // Speak the response if it's not a system message
      if (msg.type !== 'system' && msg.text) {
        speak(msg.text);
      }
    });

    // Handle AI-driven UI updates
    socket.on('ui:update', (command) => {
      switch(command.type) {
        case 'setView':
          setState(s => ({
            ...s,
            context: { ...s.context, activeView: command.view }
          }));
          break;
        case 'setElements':
          setState(s => ({
            ...s,
            context: { ...s.context, selectedElements: command.elements }
          }));
          break;
        case 'setLayout':
          // Handle layout updates (columns, rows, etc)
          break;
        case 'showSection':
          // Show/hide specific sections
          break;
        case 'focusElement':
          // Focus specific element
          break;
        // ...other UI commands
      }
    });
  }, []);

  // Send context with every message
  const sendToAI = (text, type = 'user') => {
    socket.emit('chat:message', { 
      text,
      type,
      context: state.context // Send current context
    });
    setState(s => ({
      ...s,
      messages: [...s.messages, { text, type }]
    }));
  };

  // Update context when engine state changes
  useEffect(() => {
    if (engine) {
      engine.state$.subscribe(engineState => {
        setState(s => ({
          ...s,
          context: { ...s.context, engineState }
        }));
      });
    }
  }, []);

  const handleAction = (action) => {
    sendToAI(action.command);
  };

  // Speak AI responses
  const speak = (text) => {
    if (state.isSpeaking && speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (state.isListening) {
      recognition?.stop();
    } else {
      recognition?.start();
    }
    setState(s => ({ ...s, isListening: !s.isListening }));
  };

  const toggleSpeaking = () => {
    setState(s => ({ ...s, isSpeaking: !s.isSpeaking }));
    if (state.isSpeaking) {
      speechSynthesis.cancel(); // Stop current speech
    }
  };

  // Extract text from message object if needed
  const getMessageText = (msg) => {
    if (typeof msg === 'string') return msg;
    if (typeof msg.text === 'string') return msg.text;
    return JSON.stringify(msg);
  };

  // Extract text from message object
  const getMessageDisplay = (msg) => {
    if (typeof msg === 'string') return msg;
    if (typeof msg?.text === 'string') return msg.text;
    
    // Handle AI response objects
    if (msg?.type === 'ai' && msg?.actions) {
      return msg.text; // Just display text, actions handled separately
    }
    
    return 'Invalid message format';
  };

  // Handle voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks);
        socket.emit('voice:data', audioBlob);
      };

      mediaRecorder.start();
      setState(s => ({ ...s, isListening: true, mediaRecorder }));
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    state.mediaRecorder?.stop();
    setState(s => ({ ...s, isListening: false, mediaRecorder: null }));
  };

  // Handle voice responses
  useEffect(() => {
    socket.on('voice:response', async ({ audio, text, actions }) => {
      // Play audio response
      const audioBlob = new Blob([audio], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audioPlayer = new Audio(audioUrl);
      await audioPlayer.play();
      URL.revokeObjectURL(audioUrl);

      // Update UI
      setState(s => ({
        ...s,
        messages: [...s.messages, { type: 'ai', text }],
        actions: actions || s.actions
      }));
    });
  }, []);

  return (
    <Container>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', py: 2 }}>
        {/* Voice control buttons */}
        <Paper sx={{ mb: 2, p: 1, display: 'flex', gap: 1 }}>
          <Tooltip title={state.isListening ? "Stop Listening" : "Start Listening"}>
            <IconButton 
              onClick={toggleListening}
              color={state.isListening ? "primary" : "default"}
            >
              {state.isListening ? <Mic /> : <MicOff />}
            </IconButton>
          </Tooltip>
          <Tooltip title={state.isSpeaking ? "Mute AI" : "Unmute AI"}>
            <IconButton 
              onClick={toggleSpeaking}
              color={state.isSpeaking ? "primary" : "default"}
            >
              {state.isSpeaking ? <VolumeUp /> : <VolumeOff />}
            </IconButton>
          </Tooltip>
        </Paper>

        <Paper sx={{ mb: 2, p: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {state.actions.map(action => (
            <Tooltip key={action.command} title={action.label}>
              <IconButton
                onClick={() => handleAction(action)}
                color={action.color || 'default'}
                size="small"
              >
                {getActionIcon(action.icon)}
              </IconButton>
            </Tooltip>
          ))}
        </Paper>

        <Paper sx={{ flex: 1, overflowY: 'auto', p: 2, mb: 2 }}>
          {state.messages.map((msg, i) => (
            <Box 
              key={i} 
              sx={{ 
                mb: 1,
                textAlign: msg.type === 'user' ? 'right' : 'left',
                color: msg.type === 'error' ? 'error.main' : 'inherit'
              }}
            >
              {getMessageDisplay(msg)}
            </Box>
          ))}
        </Paper>

        <TextField 
          fullWidth
          placeholder="Ask me anything..."
          onKeyPress={e => {
            if (e.key === 'Enter') {
              sendToAI(e.target.value);
              e.target.value = '';
            }
          }}
        />
      </Box>
    </Container>
  );
}

const getActionIcon = (name) => {
  const icons = {
    play: <PlayArrow />,
    stop: <Stop />,
    list: <List />,
    add: <Add />,
    chart: <ShowChart />,
    delete: <DeleteOutline />
  };
  return icons[name] || <List />;
};

export default App;