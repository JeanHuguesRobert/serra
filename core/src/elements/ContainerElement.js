import { Element } from '../Element';
import { ElementTypes } from '../types/ElementTypes';

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