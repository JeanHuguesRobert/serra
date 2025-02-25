import { ElementModel } from '../models/ElementModel.js';
import { FormulaElement } from '../elements/FormulaElement.js';
import { Element } from '../elements/Element.js';

export class ModelFactory {
  constructor(engine) {
    this.engine = engine;
    this.dashboards = new Map();
  }

  createDashboard(id) {
    const dashboard = new ElementModel(id, 'dashboard');
    dashboard.setEngine(this.engine);
    this.dashboards.set(id, dashboard);
    this.engine.elements.set(id, dashboard);
    return dashboard;
  }

  createElement(dashboardId, id, type) {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard ${dashboardId} not found`);
    }

    const element = new Element(id, type);
    element.setEngine(this.engine);
    this.engine.elements.set(id, element);
    dashboard.addElement(element);
    return element;
  }

  createFormula(dashboardId, id) {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard ${dashboardId} not found`);
    }

    const formula = new FormulaElement(id);
    formula.setEngine(this.engine);
    this.engine.elements.set(id, formula);
    dashboard.addElement(formula);
    return formula;
  }

  getDashboard(id) {
    return this.dashboards.get(id);
  }

  getAllDashboards() {
    return Array.from(this.dashboards.values());
  }
}