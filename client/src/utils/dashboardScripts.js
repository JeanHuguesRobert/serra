import { socket } from '../socket';

export function initializeDashboardScripts(dashboard) {
  const elementCache = new Map();
  let cleanupFunctions = [];

  function getElement(id) {
    if (!elementCache.has(id)) {
      const element = document.getElementById(id);
      if (element) elementCache.set(id, element);
    }
    return elementCache.get(id);
  }

  function executeScripts() {
    const scripts = [
      ...(dashboard.scripts || []),
      ...(dashboard.resources?.local?.scripts ? 
          Object.values(dashboard.resources.local.scripts) : [])
    ];

    const context = {
      dashboard,
      socket,
      elements: new Proxy({}, {
        get: (target, id) => getElement(id)
      }),
      updateDisplay: (id, value) => {
        const element = getElement(id);
        if (element?.tagName === 'INPUT') {
          element.value = value;
        } else if (element) {
          element.textContent = value;
        }
      }
    };

    scripts.forEach(script => {
      try {
        const fn = new Function('context', `
          with(context) {
            const scriptFn = function() {
              ${script.code}
            };
            scriptFn();
            return typeof cleanup === 'function' ? cleanup : null;
          }
        `);
        const cleanup = fn(context);
        if (cleanup) cleanupFunctions.push(cleanup);
      } catch (error) {
        console.error('Script execution error:', error, script);
      }
    });
  }
  // Initial execution
  executeScripts();
  return {
    cleanup: () => {
      cleanupFunctions.forEach(fn => {
        try {
          fn();
        } catch (error) {
          console.error('Cleanup error:', error);
        }
      });
      cleanupFunctions = [];
      elementCache.clear();
    }
  };
}