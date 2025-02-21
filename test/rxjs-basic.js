import { BehaviorSubject, combineLatest } from 'rxjs';
import { map, distinctUntilChanged, tap } from 'rxjs/operators';

// Add computation lock
let activeComputation = null;

// Create a generic formula router
function createFormulaRouter(variables, computations) {
  const streams = {};
  const flowState = new Map();  // Track flow direction and pressure

  // Initialize streams with flow control
  Object.entries(variables).forEach(([name, initial]) => {
    streams[name] = new BehaviorSubject(initial);
    flowState.set(name, {
      pressure: 0,        // How much "pressure" is pushing value changes
      lastUpdate: 0,      // When was the last value change
      locked: false       // Is this value currently "locked" by user
    });
  });

  computations.forEach(({ inputs, output, forward, backward }) => {
    // Forward flow (natural direction)
    combineLatest(inputs.map(name => streams[name])).pipe(
      map(values => {
        const outputState = flowState.get(output);
        // Only flow if output isn't locked and has less pressure
        if (!outputState.locked && outputState.pressure <= Math.min(...inputs.map(i => flowState.get(i).pressure))) {
          return forward(...values);
        }
      }),
      distinctUntilChanged()
    ).subscribe(result => {
      if (result !== undefined) {
        const state = flowState.get(output);
        state.lastUpdate = Date.now();
        state.pressure = Math.max(...inputs.map(i => flowState.get(i).pressure)) + 1;
        streams[output].next(result);
      }
    });

    // Backward flow (pressure from output)
    streams[output].pipe(
      distinctUntilChanged(),
      map(targetValue => {
        const outputState = flowState.get(output);
        if (outputState.locked) {
          // Find most suitable input to adjust
          const adjustableInput = inputs.find(name => !flowState.get(name).locked);
          if (adjustableInput) {
            const solveIndex = inputs.indexOf(adjustableInput);
            const otherInputs = inputs
              .filter(name => name !== adjustableInput)
              .map(name => streams[name].value);
            
            return {
              input: adjustableInput,
              value: backward[solveIndex](targetValue, ...otherInputs)
            };
          }
        }
      })
    ).subscribe(update => {
      if (update) {
        const state = flowState.get(update.input);
        state.lastUpdate = Date.now();
        state.pressure = flowState.get(output).pressure + 1;
        streams[update.input].next(update.value);
      }
    });
  });

  // Return interface for UI control
  return {
    streams,
    lock: (name) => flowState.get(name).locked = true,
    unlock: (name) => flowState.get(name).locked = false,
    setPressure: (name, pressure) => flowState.get(name).pressure = pressure
  };
}

// Example usage
const formula = createFormulaRouter(
  { A: 0, B: 0, X: 0 },
  [{
    inputs: ['A', 'B'],
    output: 'X',
    forward: (a, b) => a + b,
    backward: [
      (x, b) => x - b,  // solve for A
      (x, a) => x - a   // solve for B
    ]
  }]
);

// Test sequence
console.log('\n=== Testing Forward Computation ===');
formula.A.next(5);
formula.B.next(3);

setTimeout(() => {
  console.log('\n=== Testing Backward Computation ===');
  formula.X.next(10);
}, 500);