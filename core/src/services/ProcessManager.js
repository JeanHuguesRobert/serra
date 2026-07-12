import { spawn } from 'child_process';
import { EventEmitter } from 'events';

/**
 * Manages shell processes across different implementations.
 */
export class ProcessManager {
    constructor() {
        this.activeProcesses = new Map();
        this.eventEmitter = new EventEmitter();
    }

    /**
     * Execute a shell command
     * @param {string} command - The command to execute
     * @param {string[]} args - Command arguments
     * @returns {Promise<Object>} - Resolution contains jobId, stdout, stderr, and exit code
     */
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

    /**
     * Kill a running process
     * @param {string} jobId - The ID of the process to kill
     * @returns {boolean} - True if process was killed, false if not found
     */
    killProcess(jobId) {
        const process = this.activeProcesses.get(jobId);
        if (process) {
            process.kill();
            this.activeProcesses.delete(jobId);
            return true;
        }
        return false;
    }

    /**
     * Subscribe to stdout events
     * @param {Function} callback - The callback to execute on stdout data
     * @returns {Function} - Unsubscribe function
     */
    onStdout(callback) {
        this.eventEmitter.on('stdout', callback);
        return () => this.eventEmitter.off('stdout', callback);
    }

    /**
     * Subscribe to stderr events
     * @param {Function} callback - The callback to execute on stderr data
     * @returns {Function} - Unsubscribe function
     */
    onStderr(callback) {
        this.eventEmitter.on('stderr', callback);
        return () => this.eventEmitter.off('stderr', callback);
    }
}