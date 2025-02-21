import { ComponentTypes } from '../components/ComponentTypes';

export class ComponentFactory {
  static createComponent(type, id, props = {}) {
    return {
      id,
      type,
      ...props
    };
  }

  static validateComponent(component) {
    return Boolean(
      component &&
      component.id &&
      Object.values(ComponentTypes).includes(component.type)
    );
  }

  static createDisplay(id, label, value) {
    return this.createComponent(ComponentTypes.DISPLAY, id, { label, value });
  }

  static createDashboardLink(id, label, targetId) {
    return this.createComponent(ComponentTypes.DASHBOARD_LINK, id, { label, targetId });
  }

  static createContainer(id, components = [], layout = 'vertical') {
    return this.createComponent(ComponentTypes.CONTAINER, id, { components, layout });
  }
}