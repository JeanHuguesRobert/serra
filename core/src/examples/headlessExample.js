import { createEngine } from '../factories/EngineFactory.js';

/**
 * Example of using the headless adapter
 */
function headlessExample() {
  // Create engine and get the adapter
  const { adapter } = createEngine();
  
  // Create a dashboard
  adapter.createDashboard('main');
  adapter.setCurrentDashboard('main');
  
  // Start the engine
  adapter.start();
  
  // Create some elements
  const number1 = adapter.createElement('number1', 'number');
  const number2 = adapter.createElement('number2', 'number');
  const result = adapter.createElement('result', 'display');
  
  // Set initial values
  adapter.updateElement('number1', 'value', 5);
  adapter.updateElement('number2', 'value', 10);
  
  // Create a formula to calculate the result
  const formula = adapter.createFormula('add');
  
  // Subscribe to changes
  const subscription = adapter.observe('result', 'value')
    .subscribe(value => {
      console.log(`Result updated: ${value}`);
    });
  
  // Update values to trigger the formula
  adapter.updateElement('number1', 'value', 20);
  
  // Clean up
  subscription.unsubscribe();
  adapter.stop();
}

export { headlessExample };
