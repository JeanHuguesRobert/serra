import { Element } from '../Element';
import { ElementTypes } from '../types/ElementTypes';

export class SwitchElement extends Element {
  constructor(id) {
    super(id, ElementTypes.SWITCH);
  }
}