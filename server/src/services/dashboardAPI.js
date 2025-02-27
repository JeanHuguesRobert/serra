const dashboardManager = require('./dashboardManager');

class DashboardAPI {
  constructor() {
    this.currentDashboard = null;
  }

  // Core manipulation methods
  async addElement(element) {
    if (!this.currentDashboard) return null;
    
    this.currentDashboard.content.components.push(element);
    await dashboardManager.saveDashboard(this.currentDashboard.id, this.currentDashboard);
    return element;
  }

  async updateElement(elementId, updates) {
    if (!this.currentDashboard) return null;
    
    const element = this.currentDashboard.content.components.find(c => c.id === elementId);
    if (element) {
      Object.assign(element, updates);
      await dashboardManager.saveDashboard(this.currentDashboard.id, this.currentDashboard);
      return element;
    }
    return null;
  }

  async addRelationship(sourceId, targetId, formula) {
    if (!this.currentDashboard) return null;
    
    const source = this.currentDashboard.content.components.find(c => c.id === sourceId);
    const target = this.currentDashboard.content.components.find(c => c.id === targetId);
    
    if (source && target) {
      source.relationships = source.relationships || [];
      source.relationships.push(targetId);
      source.formula = formula;
      
      // Add or update the relationship script
      const scriptId = `relationship-${sourceId}-${targetId}`;
      const scriptIndex = this.currentDashboard.content.scripts.findIndex(s => s.id === scriptId);
      const script = {
        id: scriptId,
        code: `
          (function() {
            const source = document.getElementById('${sourceId}');
            const target = document.getElementById('${targetId}');
            if (source && target) {
              source.addEventListener('change', (event) => {
                const result = (${formula})(parseFloat(event.target.value));
                target.value = result;
                updateValue('${targetId}', result);
              });
            }
          })();
        `
      };

      if (scriptIndex >= 0) {
        this.currentDashboard.content.scripts[scriptIndex] = script;
      } else {
        this.currentDashboard.content.scripts.push(script);
      }

      await dashboardManager.saveDashboard(this.currentDashboard.id, this.currentDashboard);
      return { source, target, script };
    }
    return null;
  }

  // Dashboard state management
  async setCurrentDashboard(dashboard) {
    this.currentDashboard = dashboard;
    return dashboard;
  }

  getCurrentDashboard() {
    return this.currentDashboard;
  }

  // Remote API endpoints
  getEndpoints() {
    return {
      addElement: '/api/dashboard/element',
      updateElement: '/api/dashboard/element/:id',
      addRelationship: '/api/dashboard/relationship',
      getCurrentDashboard: '/api/dashboard/current'
    };
  }
}

module.exports = new DashboardAPI();