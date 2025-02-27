/**
 * EngineContext provides React components access to the Engine instance.
 * It maintains a single engine instance and handles:
 * - Remote command execution
 * - State synchronization with server
 * - Safe API access for components
 * - Batch job processing
 * 
 * The context uses a restricted API pattern to prevent misuse of
 * engine capabilities from UI components.
 */

import React, { createContext, useContext, useEffect, useCallback, useState } from 'react';
import { Engine } from '../../../core/src/Engine.js';
import { socket } from '../socket/socket.js';
import { SOCKET_EVENTS } from '../../../core/src/constants/events.js';
import { EventEmitter } from 'events';

// Single engine instance maintained across app lifetime
let engineInstance = null;

const EngineContext = createContext();

export function EngineProvider({ children }) {
  useEffect(() => {
    if (!engineInstance) {
      console.log('[Engine] Creating single engine instance');
      engineInstance = new Engine();
      
      // Sync engine state with server
      engineInstance.on('stateChange', (state) => {
        console.log('[Engine] State changed:', state);
        socket.emit(SOCKET_EVENTS.ENGINE.STATE, state);
      });

      // Handle remote commands
      socket.on(SOCKET_EVENTS.ENGINE.COMMAND, (data) => {
        if (data.command === 'list') {
          const elements = engineInstance.getElements();
          const listing = elements.map(el => 
            `[${el.getType()}] ${el.id}: ${el.getValue()}`
          ).join('\n');

          socket.emit(SOCKET_EVENTS.CHAT.RESPONSE, {
            text: elements.length ? 
              `Current Elements:\n${listing}` : 
              'No elements in current dashboard',
            type: 'system'
          });
        }
      });

      // Create restricted API for safe remote execution
      const restrictedApi = {
        rest: {
          // HTTP methods with built-in safety checks
          get: (url) => fetch(url).then(r => r.json()),
          post: (url, data) => fetch(url, { 
            method: 'POST', 
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
          }).then(r => r.json()),
          put: (url, data) => fetch(url, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
          }).then(r => r.json()),
          delete: (url) => fetch(url, { method: 'DELETE' }).then(r => r.json())
        },
        engine: {
          // Safe subset of engine capabilities
          elements: engineInstance.getElements(),
          getElement: (id) => engineInstance.getElement(id),
          start: () => engineInstance.start(),
          stop: () => engineInstance.stop()
        }
      };

      // Handle run commands
      socket.on(SOCKET_EVENTS.ENGINE.RUN, async ({ code }) => {
        try {
          const fn = new Function('rest', 'engine', `return (async () => { ${code} })()`);
          const result = await fn(restrictedApi.rest, restrictedApi.engine);
          
          socket.emit(SOCKET_EVENTS.CHAT.RESPONSE, {
            text: result !== undefined ? `Result: ${JSON.stringify(result)}` : 'Command executed',
            type: 'system'
          });
        } catch (error) {
          socket.emit(SOCKET_EVENTS.CHAT.RESPONSE, {
            text: `Error: ${error.message}`,
            type: 'error'
          });
        }
      });

      // Handle batch jobs
      socket.on(SOCKET_EVENTS.ENGINE.JOB_SUBMIT, async ({ jobId, code }) => {
        console.log(`[Engine] Running job ${jobId}`);
        socket.emit(SOCKET_EVENTS.CHAT.RESPONSE, {
          text: `Job ${jobId} submitted`,
          type: 'system'
        });

        try {
          const result = await (new Function('rest', 'engine', code))(restrictedApi.rest, restrictedApi.engine);
          
          socket.emit(SOCKET_EVENTS.ENGINE.JOB_COMPLETE, {
            jobId,
            result: result !== undefined ? JSON.stringify(result) : 'Job completed'
          });

        } catch (error) {
          socket.emit(SOCKET_EVENTS.ENGINE.JOB_ERROR, {
            jobId,
            error: error.message
          });
        }
      });
    }

    return () => {
      // Don't destroy engine on unmount, just stop it
      engineInstance?.stop();
    };
  }, []);

  return (
    <EngineContext.Provider value={{ engine: engineInstance }}>
      {children}
    </EngineContext.Provider>
  );
}

export const useEngine = () => {
  const context = useContext(EngineContext);
  if (!context) throw new Error('useEngine must be used within EngineProvider');
  return context;
};

export function useElementValue(id) {
  const { engine } = useEngine();
  const [value, setValue] = useState(null);
  const [type, setType] = useState(null);
  
  useEffect(() => {
    if (!engine) {
      return;
    }
    
    const element = engine.getElement(id);
    if (!element) {
      return;
    }

    try {
      const elementType = element.getType?.() || 'unknown';
      setType(elementType);
      
      const rawValue = element.getValue?.() || null;
      const processedValue = elementType === 'number' ? parseFloat(rawValue) || 0 : rawValue;
      
      setValue(processedValue);
      
      const subscription = engine.observe(id, 'value')
        .subscribe(newValue => {
          const processedNewValue = elementType === 'number' ? parseFloat(newValue) || 0 : newValue;
          setValue(processedNewValue);
        });
      
      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error(`Error processing element ${id}:`, error);
      return;
    }
  }, [engine, id]);
  
  return {
    value,
    type
  };
}

export function useUpdateElement() {
  const { engine } = useEngine();
  
  return useCallback((id, property, value) => {
    if (engine) {
      engine.updateElement(id, property, value);
    }
  }, [engine]);
}

export function useCreateElement() {
  const { engine } = useEngine();
  
  return useCallback((id, type) => {
    if (engine) {
      return engine.createElement(id, type);
    }
    return null;
  }, [engine]);
}

export function useRenderElement() {
  const { engine } = useEngine();
  
  return useCallback((element, props = {}) => {
    if (!engine) {
      return null;
    }
    
    // If element is an ID string, get the actual element
    const actualElement = typeof element === 'string' 
      ? engine.getElement(element)
      : element;
      
    if (!actualElement) {
      return null;
    }
    
    const elementData = {
      id: actualElement.id,
      type: actualElement.getType(),
      value: actualElement.getValue(),
      properties: actualElement.getProperties ? actualElement.getProperties() : {}
    };
    
    // Render based on element type
    switch (elementData.type) {
      case 'display':
        return (
          <div key={`${props.dashboardId}-${elementData.id}`} className="display-container">
            <div>{elementData.properties.label || ''}</div>
            <div id={elementData.id} className={elementData.properties.className || ''}>
              {elementData.value}
            </div>
          </div>
        );
      // Add other element type renderers as needed
      default:
        return (
          <div key={`${props.dashboardId}-${elementData.id}`}>
            {elementData.id}: {elementData.value}
          </div>
        );
    }
  }, [engine]);
}

export default EngineContext;
