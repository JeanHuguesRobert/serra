export class DashboardCommands {
  constructor(engine) {
    this.engine = engine;
  }

  // Basic dashboard operations
  create(name) {
    return this.engine.createDashboard(name);
  }

  addElement(dashboardId, type, id, properties = {}) {
    const element = this.engine.createElement(id, type);
    Object.entries(properties).forEach(([key, value]) => {
      element.setProperty(key, value);
    });
    return element;
  }

  // Formula and relationship management
  setFormula(outputId, inputs, formula) {
    const func = this.engine.createElement(`formula-${outputId}`, 'function');
    func.setFormula(inputs, formula, outputId);
  }

  // Dynamic code injection
  injectCode(elementId, code) {
    const element = this.engine.getElementById(elementId);
    if (element) {
      const dynamicFunction = new Function('value', 'state', code);
      element.setComputation(dynamicFunction);
    }
  }

  // State querying and manipulation
  getValue(elementId) {
    const element = this.engine.getElementById(elementId);
    return element ? element.getProperty('value') : null;
  }

  setValue(elementId, value) {
    const element = this.engine.getElementById(elementId);
    if (element) {
      element.setProperty('value', value);
      return this.getDependencies(elementId);
    }
  }

  // Dependency tracking
  getDependencies(elementId) {
    return this.engine.getDependencyGraph(elementId);
  }

  // State observation
  observe(elementId, callback) {
    const element = this.engine.getElementById(elementId);
    if (element) {
      element.value$.subscribe(callback);
    }
  }
}