import { Element } from '../Element.js';
import { Subject } from 'rxjs';

export class NumberElement extends Element {
  constructor(id) {
    super(id, 'number');
  }

  setValue(value) {
    const numValue = parseFloat(value) || 0;
    super.setValue(numValue);
  }
}