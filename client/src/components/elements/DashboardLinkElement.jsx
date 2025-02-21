import BaseElement from './BaseElement';

class DashboardLinkElement extends BaseElement {
  constructor(props) {
    super(props);
    this.targetId = props.targetId;
  }

  validate() {
    return super.validate() && 
           this.type === 'dashboard-link' && 
           typeof this.targetId === 'string';
  }
}

export default DashboardLinkElement;