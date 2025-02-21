const fs = require('fs').promises;
const path = require('path');

class DashboardManager {
  constructor() {
    this.dashboardsPath = path.join(__dirname, '../data');
  }

  async getDashboard(id) {
    try {
      console.log('Loading dashboard:', id);
      const filePath = path.join(this.dashboardsPath, `${id}.json`);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error loading dashboard ${id}:`, error);
      // Fallback to first.json if requested dashboard not found
      if (error.code === 'ENOENT') {
        const defaultPath = path.join(this.dashboardsPath, 'first.json');
        const defaultData = await fs.readFile(defaultPath, 'utf8');
        return JSON.parse(defaultData);
      }
      throw error;
    }
  }

  async getInitialDashboard() {
    return this.getDashboard('first');
  }
}

module.exports = new DashboardManager();