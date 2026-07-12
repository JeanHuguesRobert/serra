import { Element } from './Element.js';
import { ElementTypes } from '../types/ElementTypes.js';

export class SwitchElement extends Element {
  constructor(id) {
    super(id, ElementTypes.SWITCH);
  }
}
