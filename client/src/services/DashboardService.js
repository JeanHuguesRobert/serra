import { socket } from '../socket';

class DashboardService {
  constructor() {
    this.listeners = new Map();
    this.currentDashboard = null;
    this.setupSocketListeners();
  }

  setupSocketListeners() {
    socket.on('dashboard-refresh', this.handleDashboardRefresh.bind(this));
    socket.on('dashboard-response', this.handleDashboardResponse.bind(this));
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

  requestDashboard(id = 'first') {
    socket.emit('request-dashboard', id);
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
    socket.off('dashboard-refresh', this.handleDashboardRefresh);
    socket.off('dashboard-response', this.handleDashboardResponse);
    this.listeners.clear();
  }
}

export default new DashboardService();