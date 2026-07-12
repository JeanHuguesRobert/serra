import { Element } from './Element.js';
import { ElementTypes } from '../types/ElementTypes.js';

export class InputElement extends Element {
  constructor(id) {
    super(id, ElementTypes.INPUT);
  }
}
