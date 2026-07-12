import { Element } from './Element.js';
import { ElementTypes } from '../types/ElementTypes.js';

export class AlertElement extends Element {
  constructor(id) {
    super(id, ElementTypes.ALERT);
  }
}
