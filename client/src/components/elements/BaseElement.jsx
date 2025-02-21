import React from 'react';

class BaseElement {
  constructor(props) {
    this.id = props.id;
    this.type = props.type;
    this.label = props.label;
    this.className = props.className;
    this.content = props.content;
  }

  validate() {
    return !!this.id && !!this.type;
  }
}

export default BaseElement;