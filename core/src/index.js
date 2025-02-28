// Core exports
export { Engine } from './Engine.js';
export { ElementTypes } from './types/ElementTypes.js';
export { ElementModel } from './models/ElementModel.js';
export { CommandProcessor } from './commands/CommandProcessor.js';
export { NumberElement } from './elements/NumberElement.js';
export { createClientSocket, createServerSocket } from './socket/index.js';

// Socket/communication exports
export { SocketService } from './socket/SocketService.js';
export { WebRTCService } from './socket/WebRTCService.js';
export { EventEmitter } from './utils/EventEmitter.js';
export { ConnectionStatusService, connectionStatusService } from './services/ConnectionStatusService.js';

// Service exports
export { AIService, AIProvider, CopilotProvider, TextSynthProvider } from './services/AIService.js';
export { AuthService, GitHubAuthProvider } from './services/AuthService.js';
export { ChatService } from './services/ChatService.js';
export { FormulaService, formulaService } from './services/FormulaService.js';
export { EngineService, engineService } from './services/EngineService.js';

// Job management exports
export { default as JobManager } from './jobs/JobManager.js';
export { default as WebWorkerJobManager } from './jobs/WebWorkerJobManager.js';
export { default as NodeWorkerJobManager } from './jobs/NodeWorkerJobManager.js';
export { Continuation } from './utils/Continuation.js';

// Command processing exports
export { DashboardCommands } from './commands/DashboardCommands.js';
export { NaturalLanguageProcessor } from './commands/NaturalLanguageProcessor.js';

// Utilities
export { createLogger } from './utils/logger.js';

console.log('Serra Core initialized');
