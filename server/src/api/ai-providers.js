import express from 'express';
import { AIProviderManager } from '../../../core/src/ai/ai-providers.js';

const router = express.Router();
const aiProviderManager = new AIProviderManager();

// Environment variables for AI providers
const GITHUB_API_KEY = process.env.GITHUB_API_KEY;
const SYNTHTEXT_API_KEY = process.env.SYNTHTEXT_API_KEY;
const DEFAULT_AI_PROVIDER = process.env.DEFAULT_AI_PROVIDER || 'github';
const AI_PROVIDER_TIMEOUT = parseInt(process.env.AI_PROVIDER_TIMEOUT) || 30000;

// In-memory store for provider configurations and status
let providers = {
  github: {
    name: 'github',
    status: 'configured',
    lastCheck: null,
    capabilities: ['code-generation', 'code-review'],
    quotaRemaining: 1000,
    config: {
      apiKey: GITHUB_API_KEY,
      model: 'gpt-4',
      options: {}
    }
  },
  synthtext: {
    name: 'synthtext',
    status: 'configured',
    lastCheck: null,
    capabilities: ['text-generation', 'translation'],
    quotaRemaining: 500,
    config: {
      apiKey: SYNTHTEXT_API_KEY,
      options: {}
    }
  }
};

// Store for provider logs
const providerLogs = [];

// Helper function to log provider actions
const logProviderAction = (provider, action, status, details) => {
  providerLogs.push({
    timestamp: new Date().toISOString(),
    provider,
    action,
    status,
    details
  });
};

// Get status of all AI providers
router.get('/status', (req, res) => {
  const providerList = Array.from(aiProviderManager.providers.values());
  res.json({ providers: providerList });
});

// Configure AI provider
router.post('/configure', async (req, res) => {
  try {
    const { provider, config } = req.body;
    await aiProviderManager.configureProvider(provider, config);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Switch active AI provider
router.post('/switch', async (req, res) => {
  try {
    const { provider, reason } = req.body;
    await aiProviderManager.switchProvider(provider, reason);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get provider logs
router.get('/logs', (req, res) => {
  res.json({ logs: aiProviderManager.logs });
});

export { router as aiProvidersRouter };