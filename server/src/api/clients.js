import express from 'express';
import { clientManager } from '../services/ClientManager.js';

const router = express.Router();

// Get all active clients
router.get('/active', (req, res) => {
    const activeClients = clientManager.getActiveClients();
    res.json({
        count: activeClients.length,
        clients: activeClients
    });
});

// Get last client information
router.get('/last', (req, res) => {
    const lastClient = clientManager.getLastClientInfo();
    if (lastClient) {
        res.json(lastClient);
    } else {
        res.status(404).json({ error: 'No client history available' });
    }
});

// Get specific client information
router.get('/:clientId', (req, res) => {
    const clientInfo = clientManager.getClientInfo(req.params.clientId);
    if (clientInfo) {
        res.json(clientInfo);
    } else {
        res.status(404).json({ error: 'Client not found' });
    }
});

export default router;