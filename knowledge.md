# Serra Dashboard System Knowledge

## Project Overview
Serra is an AI-assisted no-code distributed reactive system for building and running real-time dashboards with bidirectional data flow. It uses a Smart Plumbing system based on Constraint Propagation Networks.

## Key Components
- **Engine**: Central orchestrator managing dashboard lifecycle, formula registration, and computation
- **Dashboard**: Implements Factory pattern for creating elements
- **Elements**: Basic building blocks that hold values and participate in formulas
- **Formulas**: Bidirectional computation units defining relationships between elements
- **Renderers**: Platform-agnostic description of how elements should be rendered

## Project Structure
- **core/**: Contains the platform-agnostic engine, elements, formula computation, rendering system, and shared services
- **client/**: React-based frontend for the dashboard UI with DOM-dependent code
- **server/**: Backend services and API endpoints for Node.js environment
- **docs/**: Documentation for architecture, API, CLI, and formula system

## Architecture Separation
The project is designed with a clear separation of concerns across three distinct layers:

1. **Platform-Agnostic Core (core/)**
   - Engine.js: Core computation engine
   - Element.js: Base element class
   - ModelFactory.js: Factory for creating elements
   - services/: Shared services that work in any JavaScript environment
     - AIService.js: Base AI service with provider interfaces
     - AuthService.js: Base authentication service
     - ChatService.js: Base chat messaging service
     - ConnectionStatusService.js: Transport status monitoring
     - EngineService.js: Engine state and operations
     - FormulaService.js: Formula computation
   - socket/: Communication protocols and interfaces
     - SocketService.js: Abstract socket communication
     - WebRTCService.js: Abstract WebRTC communication
   - jobs/: Job management
     - JobManager.js: Base job management
     - WebWorkerJobManager.js: Browser-specific job manager
     - NodeWorkerJobManager.js: Node.js-specific job manager
   - commands/: Command processing
     - CommandProcessor.js: Process commands
     - DashboardCommands.js: Dashboard-specific commands
     - NaturalLanguageProcessor.js: NLP for commands
   - utils/: Utility functions and helpers
     - EventEmitter.js: Event handling
     - logger.js: Logging utilities
     - Continuation.js: Continuation passing
   - No dependencies on DOM, browser APIs, or UI frameworks

2. **Server Layer (server/)**
   - Node.js/Express specific implementations
   - API endpoints and server-side business logic
   - Server-specific extensions of core services
   - No DOM dependencies

3. **Client Layer (client/)**
   - DOM-dependent implementations
   - Browser-specific code
   - UI frameworks (React, Vue, etc.)
   - User interface components
   - Browser-specific extensions of core services

## Communication System
The communication system uses a layered approach:

1. **Core Communication Interfaces**
   - SocketService: Base class for socket communication
   - WebRTCService: Base class for WebRTC p2p communication
   - EventEmitter: Foundation for all event-based communication
   - ConnectionStatusService: Monitors connection status across transports

2. **Platform-Specific Implementations**
   - Browser: Uses browser WebSockets, WebRTC, and DOM events
   - Server: Uses Node.js sockets and server-specific implementations
   - Each implementation extends the core interfaces

3. **Transport Fallback System**
   - Prioritized transport selection
   - Automatic fallback between transports
   - Unified status reporting

## Service Architecture
The service architecture follows a consistent pattern:

1. **Base Service Classes (core/)**
   - Abstract base classes with common interfaces
   - Platform-agnostic implementations
   - Default behaviors where possible

2. **Platform Extensions**
   - Client: BrowserXxxService classes that extend core services
   - Server: ServerXxxService classes that extend core services
   - Each extends the base class and implements platform-specific functionality

3. **Service Registration**
   - Services are typically exposed as singletons
   - Core services may provide both class and instance exports
   - Platform services register with core services when needed

## Job Management
The job management system provides a way to run long-running tasks:

1. **JobManager**
   - Base class for managing jobs
   - Tracks job status and progress
   - Provides subscription mechanism

2. **Platform-Specific Job Managers**
   - WebWorkerJobManager: Uses Web Workers in the browser
   - NodeWorkerJobManager: Uses Worker Threads in Node.js

3. **Continuation**
   - Supports continuation-passing style
   - Allows for job chaining
   - Handles job completion callbacks

## Command Processing
The command processing system interprets user commands:

1. **CommandProcessor**
   - Processes direct commands
   - Maps commands to actions

2. **NaturalLanguageProcessor**
   - Interprets natural language input
   - Extracts commands from text

3. **DashboardCommands**
   - Dashboard-specific command implementations
   - Manages dashboard state through commands

## Dependency Inversion Pattern
The project uses dependency inversion to maintain separation between layers:

1. **Factory Functions**: Create instances without direct imports
2. **Adapter Pattern**: Expose functionality through consistent interfaces
3. **Dependency Injection**: Pass dependencies rather than importing them
4. **Functional Approach**: Use function composition for flexibility

This pattern ensures:
- No direct dependencies from UI frameworks to the core Engine
- Ability to swap implementations at any layer
- Clean testing through dependency mocking
- Consistent functional programming style

## Rendering System
The rendering system follows a layered approach:

1. **Core Adapters**
   - Provide a consistent interface to the Engine
   - Platform-agnostic with no DOM dependencies

2. **DOM Renderers**
   - Handle DOM manipulation and browser integration
   - Framework-agnostic but browser-dependent

3. **Framework Components**
   - React: Components and hooks that use DOM renderers
   - Vue: Components and composables that use DOM renderers
   - Each framework implementation is isolated

## Package Management
- Project uses npm workspaces with separate package.json files in core, client, and server
- Core package is imported by both client and server
- Main scripts are in the root package.json

## Development Practices
- Use ES modules (type: "module")
- Tests are run with Jest
- Client uses Vite for development and building

## Key Technologies
- React for frontend
- Express for backend
- Socket.io for real-time communication
- RxJS for reactive programming
- WebRTC for peer-to-peer communication

## Best Practices for Code Organization
1. **Core-First Development**
   - Implement core functionality first without platform dependencies
   - Use interfaces and abstract classes to define contracts
   - Test at the core level for platform-agnostic behavior

2. **Platform Adapters**
   - Create adapters for platform-specific features
   - Implement the same interface across platforms
   - Use dependency injection to provide the right adapter

3. **UI Independence**
   - Keep UI logic separate from business logic
   - Use state observables to connect UI to core
   - Implement UI with multiple frameworks as needed
