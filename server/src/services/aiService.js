import { CommandProcessor } from '../../../core/src/commands/CommandProcessor.js';
import { NaturalLanguageProcessor } from '../../../core/src/commands/NaturalLanguageProcessor.js';
import { Server } from 'socket.io';
import EventEmitter from 'events';
import { Octokit } from '@octokit/rest';

/**
 * AIService combines socket handling and AI processing.
 * Acts as both socket server and message processor.
 * 
 * Design:
 * - Single point of communication
 * - Maintains message history
 * - Handles timeouts and retries
 * - Processes commands and natural language
 */
class AIService extends EventEmitter {
  constructor() {
    super();
    this.jobCounter = 0;
    this.clients = new Map();
    this.commandProcessor = new CommandProcessor(this.documentation);
    this.nlProcessor = new NaturalLanguageProcessor();
    this.pendingResponses = new Map();
    this.setupCommandHandlers();
    this.responses = new Map([
      ['hi', 'Hello! How can I help you today?'],
      ['hello', 'Hi there! What can I do for you?'],
      ['help', 'You can ask me about commands using /? or tell me what you want to create.'],
      ['/?', this.getHelpText()],
      ['/help', this.getHelpText()],
      ['/list', (text, socket) => {
        socket.emit('engine:command', { command: 'list' });
        return null; // Don't send a response, let client handle it
      }],
      ['/ls', (text, socket) => {
        socket.emit('engine:command', { command: 'list' });
        return null; // Don't send a response, let client handle it
      }],
      ['/run', (text, socket) => {
        const jobId = `JOB${++this.jobCounter}`;
        const code = text.substring(5); // Remove /run prefix
        
        socket.emit('engine:job:submit', { 
          jobId,
          code 
        });
        
        return `Submitted job ${jobId}`;
      }],
      ['/api', () => this.getApiHelp()],
      ['/jobs', () => this.getJobHelp()]
    ]);

    // GitHub API setup for AI interaction
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });

    // Cache to avoid duplicate requests
    this.responseCache = new Map();

    // GitHub integration
    this.responses.set('/save', async (text, socket) => {
      const client = this.clients.get(socket.id);
      if (client?.engineState) {
        await this.saveDashboard(client.engineState);
        return 'Dashboard saved to your Serra repository';
      }
      return 'No dashboard state to save';
    });

    // Direct AI response handling
    this.processMessage = async (message, socket) => {
      if (!message) {
        console.error('[AI] Received empty message');
        return 'I did not receive your message. Could you try again?';
      }

      const text = message?.text || '';
      const context = message?.context || {};
      console.log('[AI] Processing user intent:', { text, context });

      try {
        // First try TextSynth voice-to-text if it's a voice message
        if (message.type === 'voice' && message.audio) {
          const transcribed = await this.textSynth.speechToText(message.audio);
          if (transcribed) {
            text = transcribed;
          }
        }

        // Handle intent analysis based on provider
        const provider = message?.provider || 'copilot';
        const response = await this.processIntent(text, context, provider);

        // If voice response requested, generate speech
        if (message.type === 'voice' && response?.text) {
          const audioBlob = await this.textSynth.textToSpeech(response.text);
          return {
            ...response,
            audio: audioBlob
          };
        }

        return response;

      } catch (error) {
        console.error('[AI] Error:', error);
        return {
          text: "I'm having trouble understanding. Could you try again?",
          actions: [
            { command: '/help', icon: 'help', label: 'Show Commands', color: 'primary' }
          ]
        };
      }
    };

    this.textSynth = {
      async processText(text) {
        const response = await fetch(`${process.env.TEXTSYNTH_API_URL}/v1/generate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.TEXTSYNTH_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text,
            model: 'llama-7b', // Use a powerful model for understanding
            max_tokens: 200,
            temperature: 0.7
          })
        });
        return response.json();
      },

      async textToSpeech(text) {
        const response = await fetch(`${process.env.TEXTSYNTH_API_URL}/v1/speech`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.TEXTSYNTH_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text,
            voice: 'en-US-Neural2-F', // Default voice
            format: 'mp3'
          })
        });
        return response.blob();
      },

      async speechToText(audioBlob) {
        const formData = new FormData();
        formData.append('audio', audioBlob);
        formData.append('model', 'whisper-1');

        const response = await fetch(`${process.env.TEXTSYNTH_API_URL}/v1/transcribe`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.TEXTSYNTH_API_KEY}`
          },
          body: formData
        });
        const { text } = await response.json();
        return text;
      }
    };
  }

  /**
   * Initialize socket server with proper CORS
   * Single entry point for all socket communication
   */
  setupServer(httpServer) {
    const io = new Server(httpServer, {
      cors: { origin: '*', methods: ['GET', 'POST'] }
    });

    io.on('connect', (socket) => {
      console.log('[AI] Client connected:', socket.id);
      
      // Track client state
      this.clients.set(socket.id, {
        connected: Date.now(),
        engineState: null
      });

      // Send welcome message
      socket.emit('chat:welcome', {
        message: 'Welcome to Serra!'
      });

      // Handle chat messages
      socket.on('chat:message', async (msg) => {
        console.log('[AI] Message received:', msg);
        try {
          const response = await this.processMessage(msg.text, socket);
          if (response) {
            socket.emit('chat:response', { text: response });
          }
        } catch (error) {
          console.error('[AI] Error:', error);
        }
      });

      // Handle voice messages
      socket.on('voice:data', async (audioBlob) => {
        try {
          const text = await this.textSynth.speechToText(audioBlob);
          const response = await this.processMessage({ text, type: 'user' }, socket);
          
          // Get voice response
          if (response?.text) {
            const audioBlob = await this.textSynth.textToSpeech(response.text);
            socket.emit('voice:response', {
              audio: audioBlob,
              text: response.text,
              actions: response.actions
            });
          }
        } catch (error) {
          console.error('[Voice] Error:', error);
        }
      });

      // Track engine state updates
      socket.on('engine:state', (state) => {
        const client = this.clients.get(socket.id);
        if (client) {
          client.engineState = state;
        }
      });

      socket.on('disconnect', () => {
        console.log('[AI] Client disconnected:', socket.id);
        this.clients.delete(socket.id);
      });
    });

    return io;
  }

  getHelpText() {
    return `Available Commands:

General:
/help, /? - Show this help message
/status   - Show engine and system status

Engine Control:
/start    - Start the engine
/stop     - Stop the engine
/restart  - Restart the engine

Dashboard:
/dash list   - List all dashboards
/dash create - Create a new dashboard
/dash switch - Switch to a different dashboard

Elements:
/add number  - Add a number element
/add led     - Add an LED element
/add display - Add a display element
/add formula - Add a formula element`;
  }

  getApiHelp() {
    return `Available Client-Side API:

HTTP REST:
rest.get(url)     - GET request
rest.post(url, data) - POST request
rest.put(url, data)  - PUT request
rest.delete(url)     - DELETE request

Engine:
engine.elements      - Get all elements
engine.getElement(id) - Get element by ID
engine.start()       - Start engine
engine.stop()        - Stop engine

Examples:
/run const els = engine.elements; console.log(els.length);
/run const temp = await rest.get('/api/sensor/temp');
/run engine.getElement('led1').setValue(true);`;
  }

  getJobHelp() {
    return `Batch Job Commands:
/run <code>   - Submit a new job
Example batch jobs:
/run engine.elements.forEach(el => { if(el.type === 'led') el.setValue(true); });
/run await rest.post('/api/batch', { command: 'reset-all' });
/run engine.getElements().filter(el => el.type === 'number').length;`;
  }

  getElementsList(engineState) {
    if (!engineState?.elements || engineState.elements.length === 0) {
      return 'No elements in current dashboard';
    }

    const elements = engineState.elements.map(el => 
      `[${el.type}] ${el.id}: ${el.value}`
    ).join('\n');

    return `Current Dashboard Elements:\n${elements}`;
  }

  setupCommandHandlers() {
    // Listen for command events and emit corresponding socket events
  }

  async processMessage(message, socket) {
    if (!message) {
      console.error('[AI] Received empty message');
      return {
        text: 'I did not receive your message. Could you try again?',
        actions: [{ command: '/help', icon: 'help', label: 'Show Help', color: 'primary' }]
      };
    }

    try {
      const text = message?.text || '';
      const context = message?.context || {};
      console.log('[AI] Processing user intent:', { text, context });

      // First try Copilot direct understanding
      const response = await this.processIntent(text, context);
      if (response) return response;

      // If needed, enhance with TextSynth understanding
      const aiUnderstanding = await this.textSynth.processText(
        `Understand user intent: ${text}\nContext: ${JSON.stringify(context)}`
      );
      
      return this.interpretAndRespond(aiUnderstanding, { text, ...context });

    } catch (error) {
      console.error('[AI] Error:', error);
      return {
        text: "I'm having trouble understanding. Let me suggest some basic actions:",
        actions: [
          { command: '/help', icon: 'help', label: 'Show Commands', color: 'primary' }
        ]
      };
    }
  }

  async interpretAndRespond(aiUnderstanding, context) {
    // Extract intent from TextSynth response
    const response = aiUnderstanding?.text || '';
    
    // If no meaningful response from TextSynth, use my own interpretation
    if (!response.trim()) {
      return this.processIntent(context?.text || '', context);
    }

    // Parse TextSynth response for actions
    const suggestedActions = [];
    if (response.includes('temperature')) {
      suggestedActions.push(
        { command: '/add temp-sensor', icon: 'add', label: 'Add Temperature Sensor', color: 'primary' },
        { command: '/add temp-chart', icon: 'chart', label: 'Add Live Chart', color: 'info' }
      );
    }
    if (response.includes('dashboard')) {
      suggestedActions.push(
        { command: '/dash create', icon: 'add', label: 'Create Dashboard', color: 'success' },
        { command: '/dash list', icon: 'list', label: 'Show Dashboards', color: 'info' }
      );
    }

    return {
      text: response,
      actions: suggestedActions.length ? suggestedActions : [
        { command: '/help', icon: 'help', label: 'Show Commands', color: 'primary' }
      ]
    };
  }

  // Method to manually provide response
  respondTo(messageId, response) {
    const pending = this.pendingResponses.get(messageId);
    if (pending) {
      this.pendingResponses.delete(messageId);
      return response;
    }
    return null;
  }

  async saveDashboard(state) {
    try {
      // Save to user's Serra repo
      const content = Buffer.from(JSON.stringify(state, null, 2)).toString('base64');
      const path = `dashboards/${state.id || 'default'}.json`;
      
      await this.octokit.repos.createOrUpdateFileContents({
        owner: process.env.GITHUB_USER,
        repo: 'serra-dashboards',
        path,
        message: `Update dashboard ${state.id}`,
        content,
        sha: await this.getFileSha(path)
      });

      // Create learning data for AI
      await this.octokit.issues.create({
        owner: process.env.GITHUB_USER,
        repo: 'serra-dashboards',
        title: `Dashboard Analysis: ${state.id}`,
        body: `\`\`\`json\n${JSON.stringify({
          elements: state.elements.length,
          types: state.elements.map(e => e.type),
          relationships: this.analyzeRelationships(state)
        }, null, 2)}\n\`\`\``
      });

    } catch (error) {
      console.error('[AI] Error saving dashboard:', error);
      throw error;
    }
  }

  async getFileSha(path) {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: process.env.GITHUB_USER,
        repo: 'serra-dashboards',
        path
      });
      return data.sha;
    } catch {
      return null; // File doesn't exist yet
    }
  }

  analyzeRelationships(state) {
    // Extract formula relationships for AI learning
    return state.elements
      .filter(el => el.type === 'formula')
      .map(formula => ({
        inputs: formula.inputs,
        expression: formula.expression,
        pattern: this.classifyFormula(formula.expression)
      }));
  }

  async processIntent(text, context) {
    const intent = text.toLowerCase();

    // Temperature monitoring intents
    if (intent.includes('temperature') || intent.includes('monitor')) {
      return {
        text: "I understand you want to monitor temperature. I'll help you set that up. Would you like a sensor display and a live chart?",
        actions: [
          { command: '/add temp-sensor', icon: 'add', label: 'Add Temperature Sensor', color: 'primary' },
          { command: '/add temp-chart', icon: 'chart', label: 'Add Live Chart', color: 'info' },
          { command: '/add alert', icon: 'warning', label: 'Add High Temp Alert', color: 'error' }
        ],
        uiActions: [
          { type: 'setView', view: 'monitoring' }
        ]
      };
    }

    // Dashboard management intents
    if (intent.includes('save') || intent.includes('dashboard')) {
      return {
        text: "I can help you manage your dashboard. What would you like to do?",
        actions: [
          { command: '/save', icon: 'save', label: 'Save Current', color: 'primary' },
          { command: '/dash create', icon: 'add', label: 'Create New', color: 'success' },
          { command: '/dash list', icon: 'list', label: 'Show All', color: 'info' }
        ]
      };
    }

    // Help or unclear intent
    return {
      text: "I'm here to help! I can help you create dashboards, monitor sensors, or manage your setup. What interests you?",
      actions: [
        { command: '/help', icon: 'help', label: 'Show Commands', color: 'primary' },
        { command: '/examples', icon: 'code', label: 'See Examples', color: 'info' }
      ]
    };
  }
}

export { AIService };