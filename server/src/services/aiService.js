import { CommandProcessor } from '../../../core/src/commands/CommandProcessor.js';
import { NaturalLanguageProcessor } from '../../../core/src/commands/NaturalLanguageProcessor.js';
import EventEmitter from 'events';

class AIService extends EventEmitter {
  constructor() {
    super();
    this.jobCounter = 0;
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
        socket.emit(SOCKET_EVENTS.ENGINE.COMMAND, { command: 'list' });
        return null; // Don't send a response, let client handle it
      }],
      ['/ls', (text, socket) => {
        socket.emit(SOCKET_EVENTS.ENGINE.COMMAND, { command: 'list' });
        return null; // Don't send a response, let client handle it
      }],
      ['/run', (text, socket) => {
        const jobId = `JOB${++this.jobCounter}`;
        const code = text.substring(5); // Remove /run prefix
        
        socket.emit(SOCKET_EVENTS.ENGINE.JOB_SUBMIT, { 
          jobId,
          code 
        });
        
        return `Submitted job ${jobId}`;
      }],
      ['/api', () => this.getApiHelp()],
      ['/jobs', () => this.getJobHelp()]
    ]);
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
    this.lastSocket = socket;
    try {
      if (!message || !message.text) {
        socket.emit('chat-message', {
          type: 'ai',
          text: 'Hello! How can I help you today? Type /help or ? for available commands.',
          messageId: Date.now().toString()
        });
        return;
      }

      const text = message.text.trim();
      const messageId = Date.now().toString();

      // Handle commands without showing "Thinking..." message
      if (text.startsWith('/')) {
        const commandResponse = text === '/help' || text === '/?' ?
          this.documentation.getCliHelp() :
          await this.processCommand(text);

        socket.emit('chat-message', {
          type: 'ai',
          text: commandResponse,
          cliCommand: true,
          messageId
        });
        return;
      }

      // Only show "Thinking..." for non-command messages
      console.log(`[${new Date().toISOString()}] Sending "Thinking..." message for messageId: ${messageId}`);
      socket.emit('chat-message', {
        type: 'ai',
        text: 'Thinking...',
        messageId
      });

      // Set up timeout
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
          if (this.pendingResponses.has(messageId)) {
            console.log(`[${new Date().toISOString()}] Message ${messageId} timed out after 10 seconds`);
            this.pendingResponses.delete(messageId);
            socket.emit('chat-message', {
              type: 'ai',
              text: 'Sorry, not available at the moment, retry later, thanks.',
              messageId
            });
            resolve(); // Resolve the promise to prevent hanging
          }
        }, 10000);
      });

      // Store the message context for manual response
      this.pendingResponses.set(messageId, {
        socket,
        message: text,
        timestamp: Date.now()
      });

      // Provide real-time command suggestions
      if (text.startsWith('/') || text.length > 2) {
        const suggestions = this.documentation.getCommandSuggestions(text);
        if (suggestions.length > 0) {
          socket.emit('command-suggestions', {
            suggestions,
            context: text
          });
        }
      }

      // Parse natural language to commands
      const parsedCommand = this.nlProcessor.parseCommand(text);
      if (parsedCommand) {
        const { command, args } = parsedCommand;
        const result = await this.commandProcessor.processCommand(command, args);
        
        socket.emit('chat-message', {
          type: 'ai',
          text: result.message,
          cliCommand: `${command.replace('.', ' ')} ${Object.values(args).join(' ')}`
        });
        return;
      }

      // Don't send default response immediately
      // The response will either come from manual input or timeout
    } catch (error) {
      console.error('AI Service Error:', error);
      socket.emit('chat-message', {
        type: 'error',
        text: "I apologize, but I encountered an error processing your request.",
        cliCommand: null
      });
    }
  }

  async processMessage(text, socket) {
    const messageId = Date.now().toString();
    const client = this.clients?.get(socket.id);
    const engineState = client?.engineState;

    // Handle basic responses and commands
    const handler = this.responses.get(text.toLowerCase());
    if (handler) {
      return typeof handler === 'function' ? 
        handler(text, engineState) : 
        handler;
    }

    // Store message for manual response
    this.pendingResponses.set(messageId, {
      socket,
      message: text,
      timestamp: Date.now()
    });

    // Add timeout for pending response
    setTimeout(() => {
      if (this.pendingResponses.has(messageId)) {
        console.log(`Message ${messageId} timed out after 10s:`, text);
        this.pendingResponses.delete(messageId);
        return `I understand you said "${text}", but I need more time to process that.`;
      }
    }, 10000);

    // Return thinking message
    return 'Thinking about your request...';
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
}

export { AIService };