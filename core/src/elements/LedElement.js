import { Element } from './Element.js';
import { ElementTypes } from '../types/ElementTypes.js';

export class LedElement extends Element {
  constructor(id) {
    super(id, ElementTypes.LED);
    this._state = false;
  }

  setValue(value) {
    this._state = Boolean(value);
    super.setValue(this._state);
  }

  getValue() {
    return this._state;
  }

  toggle() {
    this.setValue(!this._state);
    return this._state;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      state: this._state
    };
  }
}
