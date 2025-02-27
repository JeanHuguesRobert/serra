import { promises as fs } from 'fs';
import path from 'path';

class DashboardManager {
  constructor() {
    // Use fileURLToPath for proper path resolution
    const currentDir = path.dirname(new URL(import.meta.url).pathname);
    // Remove leading slash and decode URI for Windows compatibility
    const normalizedDir = decodeURIComponent(currentDir.replace(/^\/?/, ''));
    this.dashboardsPath = path.join(normalizedDir, '../data');
    this.formulasPath = path.join(normalizedDir, '../data/formulas');
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
    return await this.getDashboard('first');
  }
  async saveFormula(dashboardId, formulaId, formula) {
    try {
      await fs.mkdir(this.formulasPath, { recursive: true });
      const filePath = path.join(this.formulasPath, `${dashboardId}_${formulaId}.json`);
      await fs.writeFile(filePath, JSON.stringify(formula, null, 2));
      return true;
    } catch (error) {
      console.error(`Error saving formula ${formulaId}:`, error);
      throw error;
    }
  }
  async getFormula(dashboardId, formulaId) {
    try {
      const filePath = path.join(this.formulasPath, `${dashboardId}_${formulaId}.json`);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      console.error(`Error loading formula ${formulaId}:`, error);
      throw error;
    }
  }
}

export default new DashboardManager();