import { Engine } from '../../core/src/Engine';
import { ElementModel } from '../../core/src/models/ElementModel';

describe('Engine', () => {
  let engine;
  let dashboard;

  beforeEach(() => {
    engine = new Engine();
    dashboard = engine.createDashboard('test-dashboard');
    engine.setCurrentDashboard('test-dashboard');
  });

  describe('Element Management', () => {
    test('should create and store elements', () => {
      const element = engine.createElement('test-id', 'test-type');
      expect(element).toBeDefined();
      expect(element.id).toBe('test-id');
      expect(element.type).toBe('test-type');
      expect(engine.getElement('test-id')).toBe(element);
    });

    test('should update element properties', () => {
      const element = engine.createElement('test-id', 'test-type');
      engine.updateElement('test-id', 'testProp', 'testValue');
      expect(element.getProperty('testProp')).toBe('testValue');
    });

    test('should manage element running state', () => {
      const element = engine.createElement('test-id', 'test-type');
      element.setProperty('running', false);
      expect(element.getProperty('running')).toBe(false);
      element.setProperty('running', true);
      expect(element.getProperty('running')).toBe(true);
      element.setProperty('running', false);
      expect(element.getProperty('running')).toBe(false);
    });

    test('should handle element value property', () => {
      const element = engine.createElement('test-id', 'test-type');
      element.setValue(42);
      expect(element.getValue()).toBe(42);
    });

    test('should serialize element to JSON', () => {
      const element = engine.createElement('test-id', 'test-type');
      element.setProperty('testProp', 'testValue');
      element.setValue(42);
      
      const json = element.toJSON();
      expect(json).toEqual({
        id: 'test-id',
        type: 'test-type',
        properties: {
          testProp: 'testValue',
          value: 42
        },
        value: 42
      });
    });

    test('should manage dashboard elements', () => {
      const childDashboard = engine.createElement('dashboard-id', 'dashboard');
      const child = engine.createElement('child-id', 'test-type');
      
      childDashboard.setProperty('elements', [child]);
      expect(childDashboard.getProperty('elements')).toContain(child);
    });

    test('should handle computations', () => {
      const element = engine.createElement('test-id', 'test-type');
      const computations = {
        target1: { compute: '() => 42' },
        target2: { compute: '() => 84' }
      };
      
      element.setProperty('computations', computations);
      expect(element.getProperty('computations').target1).toBeDefined();
      expect(element.getProperty('computations').target2).toBeDefined();
    });

    test('should clean up subscriptions on dispose', () => {
      const engine = new Engine();
      const dashboard = engine.createDashboard('test-dashboard');
      engine.setCurrentDashboard('test-dashboard');
      const element = engine.createElement('test-id', 'test-type');
      const mockSubscription = { unsubscribe: jest.fn() };
      element.subscriptions.push(mockSubscription);

      element.dispose();
      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
      expect(element.subscriptions).toHaveLength(0);
    });
  });

  describe('State Management', () => {
    test('should emit state updates when elements change', (done) => {
      let elementCreated = false;
      engine.state$.subscribe(state => {
        if (!elementCreated) return;
        if (state.elements && state.elements.length > 0) {
          const testElement = state.elements.find(el => el.id === 'test-id');
          if (testElement) {
            expect(testElement.id).toBe('test-id');
            done();
          }
        }
      });
      elementCreated = true;
      engine.createElement('test-id', 'test-type');
    });
  });
});