import { Engine } from '../../core/src/Engine';

describe('Engine', () => {
  let engine;
  let dashboard;

  beforeEach(() => {
    engine = new Engine();
    dashboard = engine.createDashboard('test-dashboard');
    engine.setCurrentDashboard('test-dashboard');
  });

  afterEach(() => {
    engine?.stop();
    Engine.instance = null;
  });

  describe('Element Management', () => {
    test('should create and store elements', () => {
      const element = engine.createElement('test-id', 'test-type');
      expect(element).toBeDefined();
      expect(element.id).toBe('test-id');
      expect(element.getType()).toBe('test-type');
      expect(engine.getElement('test-id')).toBe(element);
    });

    test('should update element properties', () => {
      const element = engine.createElement('test-id', 'test-type');
      engine.updateElement('test-id', 'testProp', 'testValue');
      expect(element.getProperty('testProp')).toBe('testValue');
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
          dashboard: 'test-dashboard',
          testProp: 'testValue'
        },
        value: 42
      });
    });

    test('should manage dashboard elements', () => {
      const childDashboard = engine.createElement('dashboard-id', 'dashboard');
      const child = engine.createElement('child-id', 'test-type');
      expect(engine.getElements()).toContain(child);
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
