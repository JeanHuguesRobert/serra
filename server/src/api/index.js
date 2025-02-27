const express = require('express');
const router = express.Router();
const { AIService } = require('../../services/aiService');

const aiServiceInstance = new AIService();

// Mock socket for REST API to reuse AIService
class MockSocket {
  constructor(res) {
    this.res = res;
    this.messages = [];
    this.updates = [];
  }

  emit(event, data) {
    switch(event) {
      case 'chat-message':
        this.messages.push(data);
        break;
      case 'dashboard-update':
      case 'request-dashboard':
      case 'create-dashboard':
      case 'delete-dashboard':
        this.updates.push({ event, data });
        break;
    }
  }

  getResponse() {
    return {
      messages: this.messages,
      updates: this.updates
    };
  }
}

// Process command endpoint
router.post('/command', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Command text is required' });
    }

    const mockSocket = new MockSocket(res);
    await aiServiceInstance.processMessage({ text }, mockSocket);
    res.json(mockSocket.getResponse());
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pending responses
router.get('/responses/pending', (req, res) => {
  try {
    const pendingResponses = Array.from(aiServiceInstance.pendingResponses.keys());
    res.json({ pendingResponses });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Provide response for a specific trace ID
router.post('/responses/:traceId', (req, res) => {
  try {
    const { traceId } = req.params;
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({ error: 'Response content is required' });
    }

    const success = aiServiceInstance.provideResponse(traceId, response);
    if (success) {
      res.json({ message: 'Response provided successfully' });
    } else {
      res.status(404).json({ error: 'No pending response found for the given trace ID' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Provide response for the last question
router.post('/responses/last', (req, res) => {
  try {
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({ error: 'Response content is required' });
    }

    const success = aiServiceInstance.provideResponse(null, response);
    if (success) {
      res.json({ message: 'Response provided successfully' });
    } else {
      res.status(404).json({ error: 'No pending questions to respond to' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;