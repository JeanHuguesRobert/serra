

class DashboardService {
  constructor() {
    this.listeners = new Map();
    this.currentDashboard = null;
  }

  requestDashboard(id) {
    return fetch(`/api/dashboards/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        this.handleDashboardResponse(data);
        return data;
      })
      .catch(error => {
        console.error('Error fetching dashboard:', error);
        throw error;
      });
  }

  handleDashboardRefresh(data) {
    if (this.currentDashboard?.id === data.id) return;
    this.currentDashboard = data;
    this.notifyListeners('refresh', data);
  }

  handleDashboardResponse(data) {
    this.currentDashboard = data;
    this.notifyListeners('response', data);
  }

  getCurrentDashboard() {
    return this.currentDashboard;
  }

  updateDashboardValue(componentId, value) {
    if (!this.currentDashboard) return;
    
    const component = this.currentDashboard.content.components.find(c => c.id === componentId);
    if (component) {
      component.value = value;
      this.notifyListeners('update', this.currentDashboard);
    }
  }

  subscribe(callback) {
    const id = Date.now().toString();
    this.listeners.set(id, callback);
    return () => this.listeners.delete(id);
  }

  notifyListeners(event, data) {
    this.listeners.forEach(callback => callback(event, data));
  }

  cleanup() {
    this.listeners.clear();
  }
}

export default new DashboardService();