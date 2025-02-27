import React from 'react';

/**
 * Adapter that converts engine elements into React components
 */
export class ReactElementAdapter {
  constructor(renderRegistry) {
    this.renderRegistry = renderRegistry;
  }

  /**
   * Renders an engine element as a React component
   * @param {Object} element - The engine element to render
   * @param {Object} props - Additional props to pass to the component
   * @returns {React.ReactElement|null}
   */
  renderElement(element, props = {}) {
    if (!element || !element.type) {
      return null;
    }

    const renderer = this.renderRegistry.getRenderer(element.type);
    if (!renderer) {
      console.warn(`No renderer found for element type: ${element.type}`);
      return null;
    }

    return renderer(element, props);
  }
}

// Create and export a default adapter instance
export const defaultAdapter = new ReactElementAdapter();