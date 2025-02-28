import { spawn } from 'child_process';
import { EventEmitter } from 'events';

class ShellService {
    constructor() {
        this.activeProcesses = new Map();
        this.eventEmitter = new EventEmitter();
    }

    executeCommand(command, args = []) {
        return new Promise((resolve, reject) => {
            const jobId = Date.now().toString();
            const process = spawn(command, args, { shell: true });
            
            let stdout = '';
            let stderr = '';

            this.activeProcesses.set(jobId, process);

            process.stdout.on('data', (data) => {
                stdout += data.toString();
                this.eventEmitter.emit('stdout', { jobId, data: data.toString() });
            });

            process.stderr.on('data', (data) => {
                stderr += data.toString();
                this.eventEmitter.emit('stderr', { jobId, data: data.toString() });
            });

            process.on('close', (code) => {
                this.activeProcesses.delete(jobId);
                if (code === 0) {
                    resolve({ jobId, stdout, stderr, code });
                } else {
                    reject({ jobId, stdout, stderr, code });
                }
            });

            process.on('error', (error) => {
                this.activeProcesses.delete(jobId);
                reject({ jobId, error: error.message });
            });
        });
    }

    killProcess(jobId) {
        const process = this.activeProcesses.get(jobId);
        if (process) {
            process.kill();
            this.activeProcesses.delete(jobId);
            return true;
        }
        return false;
    }

    onStdout(callback) {
        this.eventEmitter.on('stdout', callback);
        return () => this.eventEmitter.off('stdout', callback);
    }

    onStderr(callback) {
        this.eventEmitter.on('stderr', callback);
        return () => this.eventEmitter.off('stderr', callback);
    }
}

export default new ShellService();