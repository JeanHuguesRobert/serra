import { Element } from '../Element';
import { ElementTypes } from '../types/ElementTypes';

export class InputElement extends Element {
  constructor(id) {
    super(id, ElementTypes.INPUT);
  }
}