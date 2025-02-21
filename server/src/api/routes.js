import express from 'express';
import { DashboardCommands } from '../../core/src/commands/DashboardCommands';

export function setupRoutes(app, engine) {
  const commands = new DashboardCommands(engine);
  const router = express.Router();

  router.post('/dashboard', (req, res) => {
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

  app.use('/api', router);
}