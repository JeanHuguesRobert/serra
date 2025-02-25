import { Engine } from '../../core/src/Engine';

describe('Formula Computation', () => {
  let engine;
  let dashboard;
  let a, b, c, x, y, formula0, formula1, formula2;

  beforeEach(() => {
    // Clean up any existing formulas and reset engine
    if (formula0) formula0.dispose();
    if (formula1) formula1.dispose();
    if (formula2) formula2.dispose();
    if (engine) engine.stop();

    engine = new Engine();
    dashboard = engine.createDashboard('test-dashboard');
    engine.setCurrentDashboard('test-dashboard');

    // Create elements using the dashboard's factory pattern
    a = dashboard.createElement('A', 'number');
    b = dashboard.createElement('B', 'number');
    c = dashboard.createElement('C', 'number');
    x = dashboard.createElement('X', 'number');
    y = dashboard.createElement('Y', 'number');
    formula0 = engine.createFormula('A=B');
    formula1 = engine.createFormula('X=A+B');
    formula2 = engine.createFormula('Y=X*C');

    // Initialize with 0
    a.setValue(0);
    b.setValue(0);
    c.setValue(0);

    // Set up formulas before starting the engine

    // Set up smoke formula (A = B) only for smoke test
    if (expect.getState().currentTestName.includes('smoke test')) {
      formula0.addComputations({
        A: {
          inputs: ['B'],
          compute: '(B) => B'
        },
        B: {
          inputs: ['A'],
          compute: '(A) => A'
        }
      });
    }

    // Set up first formula (X = A + B)
    formula1.addComputations({
      X: {
        inputs: ['A', 'B'],
        compute: '(A, B) => A + B'
      }
    });

    // Set up second formula (Y = X * C)
    formula2.addComputations({
      Y: {
        inputs: ['X', 'C'],
        compute: '(X, C) => X * C'
      }
    });

    // Start the engine after all elements and computations are set up
    engine.start();

    // Reset all values to 0 after engine is started
    x.setValueWithoutTrigger(0);
    y.setValueWithoutTrigger(0);
    a.setValueWithoutTrigger(0);
    b.setValueWithoutTrigger(0);
    c.setValueWithoutTrigger(0);
  });

  describe('smoke test, A = B', () => {
    test('should verify initial values before computation', () => {
      expect(a.getValue()).toBe(0);
      expect(b.getValue()).toBe(0);
    });

    test('should compute A when B changes', () => {
      b.setValue(5);
      expect(a.getValue()).toBe(5);
    });
    test('should compute B when A changes', () => {
      a.setValue(55);
      expect(b.getValue()).toBe(55);
    });
  });

  describe('Computation Chain', () => {
    test('should verify initial values before computation', () => {
      expect(a.getValue()).toBe(0);
      expect(b.getValue()).toBe(0);
    });

    test('should compute X = A + B when A changes', () => {
      a.setValue(5);
      expect(x.getValue()).toBe(5); // X = 5 + 0
    });

    test('should compute X when B changes in X = A + B ', () => {
      a.setValue(5);
      b.setValue(3);
      expect(x.getValue()).toBe(8); // X = 5 + 3
    });

    test('should compute Y = X * C when C changes', () => {
      x.setValue(16);
      c.setValue(2);
      expect(y.getValue()).toBe(32); // Y = 16 * 2
    });
  });

  afterEach(() => {
    // Clean up subscriptions
    formula0.dispose();
    formula1.dispose();
    formula2.dispose();
  });
});