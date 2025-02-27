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
- **core/**: Contains the platform-agnostic engine, elements, formula computation, and rendering system
- **client/**: React-based frontend for the dashboard UI
- **server/**: Backend services and API endpoints
- **docs/**: Documentation for architecture, API, CLI, and formula system

## Architecture Separation
The project is designed with a clear separation of concerns across three distinct layers:

1. **Platform-Agnostic Core (core/)**
   - Engine.js: Core computation engine
   - Element.js: Base element class
   - ModelFactory.js: Factory for creating elements
   - adapters/: Framework-agnostic adapters
   - No dependencies on DOM, browser APIs, or UI frameworks

2. **DOM-Dependent Layer (client/src/platform/dom/)**
   - Browser-specific but framework-agnostic code
   - DOM manipulation and event handling
   - Depends on browser APIs but not on any UI framework
   - Provides a bridge between core and UI frameworks

3. **Framework-Specific Layer**
   - **React (client/src/platform/react/)**: React components, hooks, and context
   - **Vue (client/src/platform/vue/)**: Vue components and composables
   - **Headless (server/src/platform/headless/)**: Server-side or testing implementation
   - Each implementation uses the same core and DOM layers

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

## Ongoing Separation Work
- Continuing to refine the three-layer architecture
- Creating standardized interfaces between layers
- Implementing framework-specific adapters
- Supporting headless operation for testing and server-side rendering
