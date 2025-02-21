import { Element } from '../Element';
import { ElementTypes } from '../types/ElementTypes';

export class DisplayElement extends Element {
  constructor(id) {
    super(id, ElementTypes.DISPLAY);
  }
}