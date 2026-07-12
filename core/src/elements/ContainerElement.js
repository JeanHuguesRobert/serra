import { Element } from './Element.js';
import { ElementTypes } from '../types/ElementTypes.js';

export class ContainerElement extends Element {
  constructor(id) {
    super(id, ElementTypes.CONTAINER);
    this.children = [];
  }

  addChild(element) {
    this.children.push(element);
    this.engine.notifyStateChange();
  }

  removeChild(elementId) {
    this.children = this.children.filter(child => child.id !== elementId);
    this.engine.notifyStateChange();
  }
}
