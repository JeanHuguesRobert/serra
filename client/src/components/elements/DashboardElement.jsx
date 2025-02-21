import BaseElement from './BaseElement';

class DashboardElement extends BaseElement {
  constructor(props) {
    super(props);
    this.components = props.content?.components || [];
    this.scripts = props.content?.scripts || [];
    this.styles = props.content?.styles || [];
    this.resources = props.content?.resources || {};
  }

  validate() {
    return super.validate() && Array.isArray(this.components);
  }

  static fromDashboard(dashboard) {
    return new DashboardElement({
      id: dashboard.id,
      type: 'dashboard',
      label: dashboard.title,
      content: dashboard.content,
      className: dashboard.className
    });
  }
}

export default DashboardElement;