import { BehaviorSubject } from 'rxjs';

export class Element {
  constructor(id, type) {
    this.id = id;
    this.type = type;
    this.properties = new Map();
    this.engine = null;
    this.value$ = new BehaviorSubject(0);
    this.state$ = new BehaviorSubject({});
    this.computations = new Map();
    this.subscriptions = [];
  }

  setProperty(key, value) {
    this.properties.set(key, value);
    if (key === 'value' && this.value$) {
      this.value$.next(value);
    }
    this.state$.next(this.toJSON());
  }

  dispose() {
    if (this.value$) {
      this.value$.complete();
    }
    if (this.state$) {
      this.state$.complete();
    }
    if (this.subscriptions && Array.isArray(this.subscriptions)) {
      this.subscriptions.forEach(subscription => {
        if (subscription && typeof subscription.unsubscribe === 'function') {
          subscription.unsubscribe();
        }
      });
      this.subscriptions = [];
    }
  }
  setEngine(engine) {
    this.engine = engine;
  }
  setValueWithoutTrigger(value) {
    this.setProperty('value', value);
  }
  getValue() {
    return this.getProperty('value') || 0;
  }

  setValue(value) {
    const numValue = Number(value);
    this.setProperty('value', numValue);
    if (this.value$) {
      this.value$.next(numValue);
    }
  }

  getProperty(key) {
    return this.properties.get(key);
  }
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      value: this.getValue(),
      properties: Object.fromEntries(this.properties)
    };
  }

  start() {
    // Initialize any necessary state when the engine starts
    if (!this.value$) {
      this.value$ = new BehaviorSubject(this.getValue());
    }
  }

  stop() {
    // Clean up when the engine stops
    if (this.value$) {
      this.value$.complete();
    }
  }

}