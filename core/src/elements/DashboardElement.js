import { Subject } from 'rxjs';
import { Element } from './Element.js';

export class DashboardElement extends Element {
  constructor(id) {
    super(id, 'dashboard');
    this.children = new Map();
    this.children$ = new Subject();
    this.engine = null;
  }

  setEngine(engine) {
    this.engine = engine;
    return this;
  }

  createElement(id, type) {
    if (!this.engine) throw new Error('Dashboard is not attached to an engine');
    return this.engine.modelFactory.createElement(this.id, id, type);
  }

  addElement(element) {
    this.children.set(element.id, element);
    element.setProperty('dashboard', this.id);
    this.children$.next({ type: 'add', element });
  }

  getElement(id) {
    return this.children.get(id);
  }
}
