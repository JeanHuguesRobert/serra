import BaseElement from './BaseElement';

class DisplayElement extends BaseElement {
  constructor(props) {
    super(props);
    this.value = props.value;
    this.components = props.components || [];
  }

  validate() {
    return super.validate() && this.type === 'display';
  }
}

export default DisplayElement;