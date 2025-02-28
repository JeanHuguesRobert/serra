import express from 'express';
import shellService from '../services/ShellService';

const router = express.Router();

router.post('/execute', async (req, res) => {
    try {
        const { command, args } = req.body;
        
        if (!command) {
            return res.status(400).json({ error: 'Command is required' });
        }

        const job = shellService.executeCommand(command, args || []);
        const jobId = job.jobId;

        res.json({ jobId });
    } catch (error) {
        console.error('Shell execution error:', error);
        res.status(500).json({ error: 'Failed to execute command' });
    }
});

router.get('/stream/:jobId', (req, res) => {
    const { jobId } = req.params;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendEvent = (event, data) => {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    const stdoutHandler = ({ jobId: eventJobId, data }) => {
        if (eventJobId === jobId) {
            sendEvent('stdout', data);
        }
    };

    const stderrHandler = ({ jobId: eventJobId, data }) => {
        if (eventJobId === jobId) {
            sendEvent('stderr', data);
        }
    };

    const cleanup = () => {
        shellService.eventEmitter.off('stdout', stdoutHandler);
        shellService.eventEmitter.off('stderr', stderrHandler);
    };

    shellService.eventEmitter.on('stdout', stdoutHandler);
    shellService.eventEmitter.on('stderr', stderrHandler);

    req.on('close', cleanup);
});

router.post('/kill/:jobId', (req, res) => {
    const { jobId } = req.params;
    const success = shellService.killProcess(jobId);
    res.json({ success });
});

export default router;