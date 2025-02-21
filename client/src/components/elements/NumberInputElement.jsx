import BaseElement from './BaseElement';

class NumberInputElement extends BaseElement {
  constructor(props) {
    super(props);
    this.value = props.value;
    this.step = props.step || 'any';
  }

  validate() {
    return super.validate() && this.type === 'number-input';
  }
}

export default NumberInputElement;