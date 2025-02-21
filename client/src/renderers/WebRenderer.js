import { Engine } from '../../../core/Engine';

export class WebRenderer {
  constructor() {
    this.engine = new Engine();
    this.elementCache = new Map();
  }

  mount(elementId, component) {
    const domElement = document.getElementById(elementId);
    if (!domElement) return;

    this.elementCache.set(elementId, {
      element: domElement,
      component
    });

    // Subscribe to engine updates for this component
    return this.engine.observe(component.id).subscribe(value => {
      this.updateElement(elementId, value);
    });
  }

  updateElement(elementId, value) {
    const cached = this.elementCache.get(elementId);
    if (!cached) return;

    if (cached.element.tagName === 'INPUT') {
      cached.element.value = value;
    } else {
      cached.element.textContent = value;
    }
  }
}