import { Element } from './Element.js';
import { ElementTypes } from '../types/ElementTypes.js';

export class DisplayElement extends Element {
  constructor(id) {
    super(id, ElementTypes.DISPLAY);
  }
}
