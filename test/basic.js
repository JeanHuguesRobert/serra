import { Engine } from '../core/src/Engine.js';

const engine = new Engine();
const dashboard = engine.createElement('dashboard', 'dashboard');
engine.setCurrentDashboard(dashboard.id);

// Create and initialize elements
const a = engine.createElement('A', 'number');
const b = engine.createElement('B', 'number');
const c = engine.createElement('C', 'number');
const formula1 = engine.createElement('X', 'formula');
const formula2 = engine.createElement('Y', 'formula');

// Add elements to dashboard
dashboard.addElement(a);
dashboard.addElement(b);
dashboard.addElement(c);
dashboard.addElement(formula1);
dashboard.addElement(formula2);

// Initialize with 0
a.setValue(0);
b.setValue(0);
c.setValue(0);

// Set up formula computations
// Set up first formula (X = A + B)
formula1.setComputations({
  forward: {
    inputs: ['A', 'B'],
    output: 'X',
    compute: '(A, B) => A + B'
  },
  solveForA: {
    inputs: ['X', 'B'],
    output: 'A',
    compute: '(X, B) => X - B'
  },
  solveForB: {
    inputs: ['X', 'A'],
    output: 'B',
    compute: '(X, A) => X - A'
  }
});

// Set up second formula (Y = X * C)
formula2.setComputations({
  forward: {
    inputs: ['X', 'C'],
    output: 'Y',
    compute: '(X, C) => X * C'
  },
  solveForX: {
    inputs: ['Y', 'C'],
    output: 'X',
    compute: '(Y, C) => Y / C'
  },
  solveForC: {
    inputs: ['Y', 'X'],
    output: 'C',
    compute: '(Y, X) => Y / X'
  }
});

// Add value monitoring with timestamps
[
  { el: a, id: 'A' },
  { el: b, id: 'B' },
  { el: c, id: 'C' },
  { el: formula1, id: 'X' },
  { el: formula2, id: 'Y' }
].forEach(({ el, id }) => {
  el.value$.subscribe(value => {
    console.log(`[${new Date().toISOString()}] ${id} = ${value}`);
  });
});

// Test forward computation chain
console.log('\n' + '='.repeat(50));
console.log('=== Testing Forward Computation Chain ===');
console.log('='.repeat(50));
console.log('Expected: X = A + B, Y = X * C');

setTimeout(() => {
  console.log('\n' + '-'.repeat(30));
  console.log('Step 1: Setting A = 5');
  console.log('Expected: X = 5 + 0 = 5, Y = 5 * 0 = 0');
  console.log('-'.repeat(30));
  a.setValue(5);
}, 100);

setTimeout(() => {
  console.log('\n' + '-'.repeat(30));
  console.log('Step 2: Setting B = 3');
  console.log('Expected: X = 5 + 3 = 8, Y = 8 * 0 = 0');
  console.log('-'.repeat(30));
  b.setValue(3);
}, 300);

setTimeout(() => {
  console.log('\n' + '-'.repeat(30));
  console.log('Step 3: Setting C = 2');
  console.log('Expected: Y = 8 * 2 = 16');
  console.log('-'.repeat(30));
  c.setValue(2);
}, 500);

// Test backward computation chain
setTimeout(() => {
  console.log('\n' + '='.repeat(50));
  console.log('=== Testing Backward Computation Chain ===');
  console.log('='.repeat(50));
  console.log('Step 4: Setting Y = 20');
  console.log('Expected: C = 20 / 8 = 2.5');
  formula2.setValue(20);
}, 700);

setTimeout(() => {
  console.log('\n' + '-'.repeat(30));
  console.log('Step 5: Setting X = 10');
  console.log('Expected: B = 10 - 5 = 5');
  console.log('-'.repeat(30));
  formula1.setValue(10);
}, 900);

// Keep process alive to see all results
setTimeout(() => process.exit(), 1000);