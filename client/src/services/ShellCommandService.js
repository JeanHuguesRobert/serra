import ConnectionStatusService from './ConnectionStatusService';

class ShellCommandService {
    constructor() {
        this.activeJobs = new Map();
        this.connectionStatus = ConnectionStatusService;
    }

    async executeCommand(command, args = []) {
        if (!this.connectionStatus.getConnectionState().isConnected) {
            throw new Error('Cannot execute command: Server is not connected');
        }

        try {
            const response = await fetch('/api/shell/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ command, args })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const { jobId } = await response.json();
            this.activeJobs.set(jobId, { command, args });

            // Set up SSE for real-time output
            const eventSource = new EventSource(`/api/shell/stream/${jobId}`);
            
            return new Promise((resolve, reject) => {
                let stdout = '';
                let stderr = '';

                eventSource.addEventListener('stdout', (event) => {
                    stdout += event.data;
                });

                eventSource.addEventListener('stderr', (event) => {
                    stderr += event.data;
                });

                eventSource.addEventListener('close', (event) => {
                    const { code } = JSON.parse(event.data);
                    eventSource.close();
                    this.activeJobs.delete(jobId);

                    if (code === 0) {
                        resolve({ jobId, stdout, stderr, code });
                    } else {
                        reject({ jobId, stdout, stderr, code });
                    }
                });

                eventSource.addEventListener('error', () => {
                    eventSource.close();
                    this.activeJobs.delete(jobId);
                    reject(new Error('Connection lost'));
                });
            });
        } catch (error) {
            throw new Error(`Failed to execute command: ${error.message}`);
        }
    }

    killJob(jobId) {
        if (!this.activeJobs.has(jobId)) {
            return false;
        }

        return fetch(`/api/shell/kill/${jobId}`, { method: 'POST' })
            .then(response => response.ok)
            .catch(() => false);
    }

    getActiveJobs() {
        return Array.from(this.activeJobs.entries()).map(([jobId, details]) => ({
            jobId,
            ...details
        }));
    }
}

export default new ShellCommandService();