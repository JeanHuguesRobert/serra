import { Engine } from '../../core/src/index.js';

// Create a new engine instance
const engine = new Engine();

// Create a dashboard using the factory pattern
const dashboard = engine.createDashboard('test-dashboard');
engine.setCurrentDashboard('test-dashboard');

// Create elements A, B, and X using the engine's factory pattern
const elementA = engine.createElement('A', 'number');
const elementB = dashboard.createElement('B', 'number');
const elementX = dashboard.createElement('X', 'number');

// Create a formula element using the engine's factory pattern
const formula = engine.createFormula('formula');

// Set up computations: bidirectional A=B and X=A+B
const computations = {
  'B': { compute: '(x) => x', inputs: ['A'] },
  'A': { compute: '(x) => x', inputs: ['B'] },
  'X': { compute: '(a, b) => a + b', inputs: ['A', 'B'] }
};

// Add computations to the formula element
formula.addComputations(computations);

// Start the engine to enable computations
engine.start();

// Test bidirectional updates
console.log('Setting A to 42');
elementA.setValue(42);

// Log the values of all elements
console.log('A value:', elementA.getValue());
console.log('B value:', elementB.getValue());
console.log('X value:', elementX.getValue());

// Update B's value
console.log('\nSetting B to 100');
elementB.setValue(100);

// Log the updated values
console.log('A value:', elementA.getValue());
console.log('B value:', elementB.getValue());
console.log('X value:', elementX.getValue());

// Stop the engine
engine.stop();