export const standardElements = {
  numberInput: {
    type: 'number-input',
    createConfig: (id, label = 'Number Input', value = 0) => ({
      id,
      type: 'number-input',
      label,
      value,
      script: {
        id: `script-${id}`,
        code: `
          const element = document.getElementById('${id}');
          if (element) {
            element.addEventListener('input', (event) => {
              const value = parseFloat(event.target.value) || 0;
              window.store.dispatch({
                type: 'dashboard/updateDashboardValue',
                payload: { componentId: '${id}', value }
              });
            });
          }
        `
      }
    })
  },
  
  slider: {
    type: 'slider',
    createConfig: (id, label = 'Slider', min = 0, max = 100, value = 50) => ({
      id,
      type: 'slider',
      label,
      min,
      max,
      value,
      script: {
        id: `script-${id}`,
        code: `
          const element = document.getElementById('${id}');
          if (element) {
            element.addEventListener('input', (event) => {
              const value = parseFloat(event.target.value);
              window.store.dispatch({
                type: 'dashboard/updateDashboardValue',
                payload: { componentId: '${id}', value }
              });
            });
          }
        `
      }
    })
  },
  docLink: {
    type: 'doc-link',
    createConfig: (id, label = 'Documentation', type = 'wiki', path = '') => ({
      id,
      type: 'doc-link',
      label,
      docType: type,
      path,
      script: {
        id: `script-${id}`,
        code: `
          const link = document.getElementById('${id}');
          if (link) {
            link.addEventListener('click', () => {
              const baseUrl = '${type === 'wiki' ? '/wiki' : '/docs'}';
              window.open(baseUrl + '${path}', '_blank');
            });
          }
        `
      }
    })
  }
};