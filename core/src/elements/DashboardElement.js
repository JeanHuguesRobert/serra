import { Subject } from 'rxjs';
import { Element } from './Element.js';

export class DashboardElement extends Element {
  constructor(id) {
    super(id, 'dashboard');
    this.children = new Map();
    this.children$ = new Subject();
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