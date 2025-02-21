const fs = require('fs');
const path = require('path');

const loadDashboards = () => {
  const dashboardsPath = path.join(__dirname, '../data');
  const dashboards = {};
  
  console.log('Loading dashboards from:', dashboardsPath);
  
  fs.readdirSync(dashboardsPath)
    .filter(file => file.endsWith('.json'))
    .forEach(file => {
      try {
        console.log('Loading dashboard file:', file);
        const dashboard = require(path.join(dashboardsPath, file));
        console.log('Loaded dashboard ID:', dashboard.id);
        dashboards[dashboard.id] = dashboard;
      } catch (error) {
        console.error('Error loading dashboard:', file, error);
      }
    });

  console.log('Loaded dashboards:', Object.keys(dashboards));
  return dashboards;
};

const dashboards = loadDashboards();

function getDashboard(id) {
  console.log('Requested dashboard:', id);
  console.log('Available dashboards:', Object.keys(dashboards));
  console.log('Found dashboard:', dashboards[id]?.id || 'not found');
  return dashboards[id] || dashboards['first'];
}

module.exports = { getDashboard };