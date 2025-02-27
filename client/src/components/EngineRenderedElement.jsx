import React, { memo } from 'react';
import { useEngine, useElementValue } from '../contexts/EngineContext';

/**
 * Component that renders an element from the engine using the context
 */
const EngineRenderedElement = memo(({ elementId, ...props }) => {
  const { engine, isReady } = useEngine();
  const { value, type } = useElementValue(elementId);
  
  if (!isReady || !engine) {
    return <div>Loading...</div>;
  }
  
  const element = engine.getElement(elementId);
  if (!element) {
    return <div>Element not found: {elementId}</div>;
  }
  
  // Render based on element type
  switch (type) {
    case 'display':
      return (
        <div className="display-container">
          <div>{element.getProperty('label') || ''}</div>
          <div id={elementId} className={element.getProperty('className') || ''}>
            {value}
          </div>
        </div>
      );
    // Add other element type renderers as needed
    default:
      return (
        <div>
          {elementId}: {value}
        </div>
      );
  }
});

export default EngineRenderedElement;
