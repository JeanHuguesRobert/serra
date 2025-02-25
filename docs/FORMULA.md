# Formula Computation System

## Overview
The Formula Computation system is a core component of Serra that enables bidirectional reactive computations between dashboard elements. It uses a smart constraint propagation network to maintain relationships and automatically update values.

## Core Components

### Engine
The central orchestrator that manages:
- Dashboard creation and management
- Formula registration and lifecycle
- Computation execution and scheduling

### Elements
Basic building blocks that can:
- Hold values (like numbers)
- Participate in formulas
- React to changes
- Trigger computations

### Formulas
Bidirectional computation units that:
- Define relationships between elements
- Specify computation logic
- Handle value propagation
- Support multi-directional updates

## Formula Definition

```javascript
// Example of creating and setting up a formula
const formula = engine.createFormula('X=A+B');

formula.addComputations({
  X: {
    inputs: ['A', 'B'],
    compute: '(A, B) => A + B'
  }
});
```

## Key Features

### Bidirectional Computation
Formulas can compute values in multiple directions:
```javascript
// Two-way binding example
formula.addComputations({
  A: {
    inputs: ['B'],
    compute: '(B) => B'  // A = B
  },
  B: {
    inputs: ['A'],
    compute: '(A) => A'  // B = A
  }
});
```

### Chained Computations
Formulas can be chained together to create complex relationships:
```javascript
// X = A + B, Y = X * C
formula1.addComputations({
  X: {
    inputs: ['A', 'B'],
    compute: '(A, B) => A + B'
  }
});

formula2.addComputations({
  Y: {
    inputs: ['X', 'C'],
    compute: '(X, C) => X * C'
  }
});
```

### Value Propagation
- Changes to input elements automatically trigger formula computations
- Results propagate through the computation chain
- Circular dependencies are handled gracefully

### Element Factory Pattern
Elements are created using a factory pattern through the dashboard:
```javascript
const dashboard = engine.createDashboard('my-dashboard');
const numberElement = dashboard.createElement('MyNumber', 'number');
```

## Best Practices

1. **Formula Setup**
   - Create all elements before setting up formulas
   - Define clear input/output relationships
   - Use meaningful element names

2. **Computation Chain**
   - Break complex computations into smaller formulas
   - Consider the order of computations
   - Avoid unnecessary dependencies

3. **Value Management**
   - Initialize elements with default values
   - Use setValueWithoutTrigger when needed
   - Clean up formulas using dispose()

4. **Error Handling**
   - Handle invalid inputs in compute functions
   - Validate formula definitions
   - Clean up resources in error cases

## Example Usage

```javascript
// Set up engine and dashboard
const engine = new Engine();
const dashboard = engine.createDashboard('example');

// Create elements
const a = dashboard.createElement('A', 'number');
const b = dashboard.createElement('B', 'number');
const sum = dashboard.createElement('Sum', 'number');

// Create and set up formula
const formula = engine.createFormula('Sum=A+B');
formula.addComputations({
  Sum: {
    inputs: ['A', 'B'],
    compute: '(A, B) => A + B'
  }
});

// Start the engine
engine.start();

// Update values
a.setValue(5);
b.setValue(3);
// sum will automatically update to 8
```

## Cleanup

To prevent memory leaks and ensure proper cleanup:
```javascript
// Dispose formula when no longer needed
formula.dispose();

// Stop engine when done
engine.stop();
```