import { BehaviorSubject, Subject, map } from 'rxjs';
import { ModelFactory } from './factories/ModelFactory.js';

export class Engine {
  constructor() {
    this.elements = new Map();
    this.running = false;
    this.currentDashboard = null;
    this.connections = new Map();
    this.state$ = new BehaviorSubject({ elements: [] });
    this.updates$ = new Subject();
    this.modelFactory = new ModelFactory(this);
  }
  
  start() {
    if (this.running) return;
    this.running = true;
    this.elements.forEach(element => element.start());
    this.setupComputations();
    this.elements.forEach(element => {
      if (element.computations.size > 0) {
        element.computations.forEach((computation, target) => {
          const targetElement = this.getElement(target);
          if (targetElement) {
            computation.inputs.forEach(inputId => {
              const inputElement = this.getElement(inputId);
              if (inputElement) {
                const value = inputElement.getValue();
                if (value !== undefined) {
                  this.processComputations(inputId, value);
                }
              }
            });
          }
        });
      }
    });
    this.updateState();
  }
  
  stop() {
    this.running = false;
    this.elements.forEach(element => element.stop());
  }
  
  createElement(id, type) {
    if (!this.currentDashboard) {
      throw new Error('No dashboard selected. Call setCurrentDashboard first.');
    }
    const element = this.modelFactory.createElement(this.currentDashboard, id, type);
    if (this.running) {
      element.start();
      this.setupComputations();
    }
    this.updateState();
    return element;
  }

  createDashboard(id) {
    return this.modelFactory.createDashboard(id);
  }

  createFormula(id) {
    if (!this.currentDashboard) {
      throw new Error('No dashboard selected. Call setCurrentDashboard first.');
    }
    return this.modelFactory.createFormula(this.currentDashboard, id);
  }
  
  getElement(id) {
    return this.elements.get(id);
  }
  
  updateElement(id, property, value) {
    const element = this.elements.get(id);
    if (element) {
      const oldValue = element.getProperty(property);
      if (oldValue !== value) {
        element.setProperty(property, value);
        this.updates$.next({ id, property, value });
        if (property === 'value') {
          this.processComputations(id, value);
        }
        this.updateState();
      }
    }
  }
  
  updateState() {
    const state = {
      elements: Array.from(this.elements.values()).map(element => element.toJSON())
    };
    this.state$.next(state);
  }
  
  observe(id, property) {
    return this.updates$.pipe(
      map(update => {
        if (update.id === id && update.property === property) {
          return update.value;
        }
        return this.getElement(id)?.getProperty(property);
      })
    );
  }

  setCurrentDashboard(id) {
    this.currentDashboard = id;
  }

  connect(sourceId, targetId, transform) {
    const connection = { sourceId, targetId, transform };
    if (!this.connections.has(sourceId)) {
      this.connections.set(sourceId, []);
    }
    this.connections.get(sourceId).push(connection);
  }

  setupComputations() {
    this.elements.forEach(element => {
      if (element.computations.size > 0) {
        element.computations.forEach((computation, target) => {
          const targetElement = this.getElement(target);
          if (targetElement) {
            const subscription = this.updates$.subscribe(update => {
              if (computation.inputs.includes(update.id) && update.property === 'value') {
                const inputs = computation.inputs.map(id => this.getElement(id)?.getValue());
                if (inputs.every(input => input !== undefined)) {
                  const fn = new Function(...computation.inputs, computation.compute);
                  const result = fn(...inputs);
                  if (targetElement.getValue() !== result) {
                    targetElement.setValue(result);
                  }
                }
              }
            });
            element.subscriptions.push(subscription);
          }
        });
      }
    });
  }

  processComputations(id, value) {
    const processed = new Set();
    const queue = [id];

    while (queue.length > 0) {
      const currentId = queue.shift();
      this.elements.forEach(element => {
        if (element.computations.size > 0) {
          element.computations.forEach((computation, target) => {
            if (computation.inputs.includes(currentId) && !processed.has(target)) {
              const targetElement = this.getElement(target);
              if (targetElement) {
                const inputs = computation.inputs.map(inputId => this.getElement(inputId)?.getValue());
                if (inputs.every(input => input !== undefined)) {
                  const fn = new Function(...computation.inputs, computation.compute);
                  const result = fn(...inputs);
                  if (targetElement.getValue() !== result) {
                    targetElement.setValue(result);
                    processed.add(target);
                    queue.push(target);
                  }
                }
              }
            }
          });
        }
      });
    }
  }

  getConnections(id) {
    return this.connections.get(id) || [];
  }

  getCurrentDashboard() {
    return this.currentDashboard;
  }

  getState() {
    return this.state$.getValue();
  } 

  getStateObservable() {
    return this.state$.asObservable();
  }

  getUpdatesObservable() {
    return this.updates$.asObservable();
  }

  getElements() {
    return this.elements;
  }

  getConnections() {
    return this.connections;
  }

  
}