import { FormulaElement } from '../elements/FormulaElement.js';
import { Element } from '../elements/Element.js';
import { LedElement } from '../elements/LedElement.js';
import { DashboardElement } from '../elements/DashboardElement.js';
import { NumberElement } from '../elements/NumberElement.js';
import { SwitchElement } from '../elements/SwitchElement.js';
import { InputElement } from '../elements/InputElement.js';
import { AlertElement } from '../elements/AlertElement.js';
import { ContainerElement } from '../elements/ContainerElement.js';
import { DisplayElement } from '../elements/DisplayElement.js';

export class ModelFactory {
  constructor(engine) {
    this.engine = engine;
    this.dashboards = new Map();
  }

  createDashboard(id) {
    const dashboard = new DashboardElement(id);
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

    if (!type) {
      throw new Error('Element type is required');
    }

    let element;
    switch (type) {
      
      case 'led':
        element = new LedElement(id);
        break;
      
      case 'number':
        element = new NumberElement(id);
        break;
      
      case 'switch':
        element = new SwitchElement(id);
        break;
      
      case 'text':
        element = new Element(id, type);
        break;

      case 'formula':
        element = new FormulaElement(id);
        break;
      
      case 'input':
        element = new InputElement(id);
        break;
      
      case 'button':
        element = new Element(id, type);
        break;
      
      case 'alert':
        element = new AlertElement(id);
        break;
      
      case 'container':
        element = new ContainerElement(id);
        break;
      
      case 'display':
        element = new DisplayElement(id);
        break;
      
      default:
        // Create basic element if no specific type
        element = new Element(id, type);
    }

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
