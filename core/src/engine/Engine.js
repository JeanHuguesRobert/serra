import { BehaviorSubject, Subject, map } from 'rxjs';
import { ElementModel } from '../models/ElementModel';

export class Engine {
  constructor() {
    this.elements = new Map();
    this.state$ = new BehaviorSubject({});
    this.updates$ = new Subject();
  }

  createElement(id, type) {
    const element = new ElementModel(id, type);
    this.elements.set(id, element);
    this.updateState();
    return element;
  }

  getElement(id) {
    return this.elements.get(id);
  }

  updateElement(id, property, value) {
    const element = this.elements.get(id);
    if (element) {
      element.setProperty(property, value);
      this.updateState();
    }
  }

  updateState() {
    const state = {
      elements: Array.from(this.elements.values()).map(el => el.toJSON())
    };
    this.state$.next(state);
  }

  observe(elementId) {
    return this.state$.pipe(
      map(state => state.elements?.find(el => el.id === elementId))
    );
  }

  dispatch(action) {
    switch (action.type) {
      case 'UPDATE_VALUE':
        this.updateElement(action.payload.id, 'value', action.payload.value);
        break;
      case 'ADD_ELEMENT':
        this.createElement(action.payload.id, action.payload.type);
        break;
    }
    this.updates$.next(action);
  }
}