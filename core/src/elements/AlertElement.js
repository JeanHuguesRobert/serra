import { Element } from '../Element';
import { ElementTypes } from '../types/ElementTypes';

export class AlertElement extends Element {
  constructor(id) {
    super(id, ElementTypes.ALERT);
  }
}