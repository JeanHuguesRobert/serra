import { Subject } from 'rxjs';
import { Element } from './Element.js';
import { ElementTypes } from './types/ElementTypes.js';
import { NumberElement } from './elements/NumberElement.js';
import { DashboardElement } from './elements/DashboardElement.js';
import { FormulaElement } from './elements/FormulaElement.js';
import { ActionTypes } from './types/ActionTypes.js';
import { State } from './models/State.js';
import { Action } from './models/Action.js';
import { ValidationUtils } from './utils/ValidationUtils.js';
import { ErrorHandler } from './utils/ErrorHandler.js';
import { map } from 'rxjs/operators';
// Remove this line as it creates circular dependency
// import { Engine } from './engine/Engine';

export class Engine {
  constructor() {
    this.elements = new Map();
    this.eventHandlers = new Map();
    this.state = new State();
    this.state$ = new Subject();
    this.currentDashboard = null;
  }

  setCurrentDashboard(dashboardId) {
    this.currentDashboard = dashboardId;
  }

  getCurrentDashboard() {
    return this.getElementById(this.currentDashboard);
  }
  
  createElement(id, type) {
    try {
      // Simplify validation for now
      if (!id || !type) {
        throw new Error('Invalid element creation parameters');
      }
  
      let element;
      switch (type) {
        case 'dashboard':
          element = new DashboardElement(id);
          break;
        case 'number':
          element = new NumberElement(id);
          break;
        case 'formula':
          element = new FormulaElement(id);
          break;
        default:
          element = new Element(id, type);
      }
  
      element.setEngine(this);
      this.elements.set(id, element);

      // Auto-add to current dashboard if one is set
      if (this.currentDashboard && type !== ElementTypes.DASHBOARD) {
        this.getCurrentDashboard().addElement(element);
      }

      this.notifyStateChange();
      return element;
    } catch (error) {
      const errorInfo = ErrorHandler.handleError(error, 'createElement');
      this.notifyStateChange({ type: 'ERROR', payload: errorInfo });
      throw error;
    }
  }
  
  getElementById(id) {
    try {
      if (!ValidationUtils.isValidId(id)) {
        throw new Error('Invalid element ID');
      }
      return this.elements.get(id);
    } catch (error) {
      const errorInfo = ErrorHandler.handleError(error, 'getElementById');
      this.notifyStateChange({ type: 'ERROR', payload: errorInfo });
      throw error;
    }
  }
  
  notifyStateChange(action = null) {
    this.state.update(
      Array.from(this.elements.values()),
      action
    );
    this.state$.next(this.state);
  }
  
  dispatch(actionType, payload) {
    try {
      const action = Action.create(actionType, payload);
      const handlers = this.eventHandlers.get(action.type) || [];
      handlers.forEach(handler => handler(action));
      this.notifyStateChange(action);
    } catch (error) {
      const errorInfo = ErrorHandler.handleError(error, 'dispatch');
      this.notifyStateChange({ type: 'ERROR', payload: errorInfo });
      throw error;
    }
  }
  
  on(eventType, handler) {
    try {
      if (!this.eventHandlers.has(eventType)) {
        this.eventHandlers.set(eventType, []);
      }
      this.eventHandlers.get(eventType).push(handler);
    } catch (error) {
      const errorInfo = ErrorHandler.handleError(error, 'on');
      this.notifyStateChange({ type: 'ERROR', payload: errorInfo });
      throw error;
    }
  }
}