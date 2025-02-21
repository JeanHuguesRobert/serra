import { Engine } from '../core/src/Engine.js';  // Remove /engine/ from path since Engine.js is directly in src

async function test() {
  const engine = new Engine();

  // Create and set dashboard
  const dashboard = engine.createElement('Test', 'dashboard');
  engine.setCurrentDashboard(dashboard.id);

  // Create two numbers and a formula
  engine.createElement('A', 'number');
  engine.createElement('B', 'number');
  
  const formula = engine.createElement('X', 'formula');
  formula.setComputations({
    forward: {
      inputs: ['A', 'B'],
      output: 'X',
      compute: '(a, b) => a + b'
    }
  });

  // Watch X
  dashboard.getElement('X').value$.subscribe(value => {
    console.log('X =', value);
  });

  // Set values
  dashboard.getElement('A').setValue(5);
  dashboard.getElement('B').setValue(3);
}

test().catch(console.error);