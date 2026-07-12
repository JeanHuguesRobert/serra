import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { domain } from '../../../core/src/utils/denbug.js';
import { DashboardCommands } from '../../../core/src/commands/DashboardCommands.js';

const router = express.Router();
let commands;
const logger = domain('DashboardAPI');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @route   GET /api/dashboards
 * @desc    Get all available dashboards
 * @access  Public
 */
// Load all dashboards from the data directory
const loadDashboards = () => {
  const dashboardsPath = path.join(__dirname, '../../data');
  const dashboards = {};
  
  logger.log('Loading dashboards from:', dashboardsPath);
  
  fs.readdirSync(dashboardsPath)
    .filter(file => file.endsWith('.json'))
    .forEach(file => {
      try {
        logger.log('Loading dashboard file:', file);
        const filePath = path.join(dashboardsPath, file);
        const dashboard = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        logger.log('Loaded dashboard ID:', dashboard.id);
        dashboards[dashboard.id] = dashboard;
      } catch (error) {
        logger.error('Error loading dashboard:', file, error);
      }
    });

  logger.log('Loaded dashboards:', Object.keys(dashboards));
  return dashboards;
};

const dashboards = loadDashboards();

// Get dashboard by ID or return default
function getDashboard(id) {
  logger.log('Requested dashboard:', id);
  logger.log('Available dashboards:', Object.keys(dashboards));
  
  if (!Object.keys(dashboards).length) {
    throw new Error('No dashboards loaded. Check if dashboard files exist in the data directory.');
  }
  
  const dashboard = dashboards[id] || dashboards['first'];
  if (!dashboard) {
    throw new Error(`Dashboard not found: ${id}. Available dashboards: ${Object.keys(dashboards).join(', ')}`);
  }
  
  logger.log('Found dashboard:', dashboard.id);
  return dashboard;
}

// Dashboard routes
router.get('/', (req, res) => {
  try {
    res.json(Object.values(dashboards));
  } catch (error) {
    logger.error('Error retrieving dashboards:', error);
    res.status(500).json({ error: 'Failed to retrieve dashboards' });
  }
});

/**
 * @route   GET /api/dashboards/:id
 * @desc    Get a specific dashboard by ID
 * @access  Public
 */
router.get('/:id', (req, res) => {
  try {
    const dashboard = getDashboard(req.params.id);
    res.json(dashboard);
  } catch (error) {
    logger.error('Error retrieving dashboard:', error);
    res.status(404).json({ error: error.message });
  }
});

// Dashboard command routes
router.post('/', (req, res) => {
  const { name } = req.body;
  const dashboard = commands.create(name);
  res.json({ id: dashboard.id });
});

router.post('/element', (req, res) => {
  const { dashboardId, type, id, properties } = req.body;
  const element = commands.addElement(dashboardId, type, id, properties);
  res.json({ id: element.id });
});

router.post('/formula', (req, res) => {
  const { outputId, inputs, formula } = req.body;
  commands.setFormula(outputId, inputs, formula);
  res.json({ success: true });
});

router.post('/code/:elementId', (req, res) => {
  const { code } = req.body;
  commands.injectCode(req.params.elementId, code);
  res.json({ success: true });
});

router.get('/value/:elementId', (req, res) => {
  const value = commands.getValue(req.params.elementId);
  res.json({ value });
});

router.put('/value/:elementId', (req, res) => {
  const { value } = req.body;
  const dependencies = commands.setValue(req.params.elementId, value);
  res.json({ dependencies });
});

export function setupDashboardRoutes(app, engine) {
  commands = new DashboardCommands(engine);
  return router;
}

export default router;