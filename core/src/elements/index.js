const ElementTypes = {
  button: {
    type: 'button',
    properties: {
      label: {
        type: 'string',
        required: true,
        default: 'Button'
      },
      onClick: {
        type: 'function',
        required: false
      },
      style: {
        type: 'object',
        required: false,
        default: {}
      }
    },
    validate(props) {
      if (!props.label || typeof props.label !== 'string') {
        throw new Error('Button label must be a string');
      }
      if (props.onClick && typeof props.onClick !== 'function') {
        throw new Error('onClick must be a function');
      }
    }
  },
  input: {
    type: 'input',
    properties: {
      label: {
        type: 'string',
        required: true,
        default: 'Input'
      },
      value: {
        type: 'string',
        required: false,
        default: ''
      },
      placeholder: {
        type: 'string',
        required: false
      },
      onChange: {
        type: 'function',
        required: false
      }
    },
    validate(props) {
      if (!props.label || typeof props.label !== 'string') {
        throw new Error('Input label must be a string');
      }
      if (props.value && typeof props.value !== 'string') {
        throw new Error('Input value must be a string');
      }
    }
  }
};

class ElementRegistry {
  constructor() {
    this.types = ElementTypes;
  }

  getType(type) {
    return this.types[type];
  }

  validateProps(type, props) {
    const elementType = this.getType(type);
    if (!elementType) {
      throw new Error(`Unknown element type: ${type}`);
    }
    elementType.validate(props);
  }

  getDefaultProps(type) {
    const elementType = this.getType(type);
    if (!elementType) {
      throw new Error(`Unknown element type: ${type}`);
    }

    const defaults = {};
    Object.entries(elementType.properties).forEach(([key, prop]) => {
      if ('default' in prop) {
        defaults[key] = prop.default;
      }
    });
    return defaults;
  }
}

module.exports = { ElementRegistry, ElementTypes };