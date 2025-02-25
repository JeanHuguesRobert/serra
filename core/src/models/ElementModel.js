export class ElementModel {
  constructor(id, type) {
    this.id = id;
    this.type = type;
    this.properties = new Map();
    this.running = false;
    this.computations = new Map();
    this.subscriptions = [];
  }

  start() {
    this.running = true;
  }

  stop() {
    this.running = false;
  }

  setProperty(property, value) {
    this.properties.set(property, value);
  }

  getProperty(property) {
    return this.properties.get(property);
  }

  getValue() {
    return this.getProperty('value');
  }

  setValue(value) {
    if (this.getValue() !== value) {
      this.setProperty('value', value);
    }
  }

  toJSON() {
    const json = {
      id: this.id,
      type: this.type
    };
    this.properties.forEach((value, key) => {
      json[key] = value;
    });
    return json;
  }

  addElement(element) {
    // For dashboard type elements
    if (this.type === 'dashboard') {
      this.setProperty('elements', [...(this.getProperty('elements') || []), element]);
    }
  }

  createElement(id, type) {
    if (this.type !== 'dashboard') {
      throw new Error('createElement can only be called on dashboard elements');
    }
    return this.engine.modelFactory.createElement(this.id, id, type);
  }

  createFormula(id) {
    if (this.type !== 'dashboard') {
      throw new Error('createFormula can only be called on dashboard elements');
    }
    return this.engine.createFormula(this.id, id);
  }

  setEngine(engine) {
    this.engine = engine;
  }

  addComputations(computations) {
    Object.entries(computations).forEach(([target, computation]) => {
      this.computations.set(target, computation);
    });
  }

  dispose() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
  }
}