import { Worker } from 'worker_threads';
import JobManager from './JobManager.js';

class NodeWorkerJobManager extends JobManager {
    startJob(jobId) {
        const job = this.jobs.get(jobId);
        if (!job) throw new Error(`Job ${jobId} not found`);
        if (job.status === 'running') return;

        try {
            const worker = new Worker(job.config.workerPath, {
                workerData: job.config
            });

            worker.on('message', (message) => {
                const { type, data } = message;
                switch (type) {
                    case 'progress':
                        this._updateJobProgress(jobId, data);
                        break;
                    case 'complete':
                        job.status = 'completed';
                        job.endTime = Date.now();
                        job.progress = 100;
                        this._notifySubscribers(jobId);
                        worker.terminate();
                        break;
                    case 'error':
                        this._setJobError(jobId, data);
                        worker.terminate();
                        break;
                }
            });

            worker.on('error', (error) => {
                this._setJobError(jobId, error.message);
                worker.terminate();
            });

            worker.on('exit', (code) => {
                if (code !== 0 && job.status !== 'completed' && job.status !== 'error') {
                    this._setJobError(jobId, `Worker stopped with exit code ${code}`);
                }
            });

            job.worker = worker;
            super.startJob(jobId);
        } catch (error) {
            this._setJobError(jobId, error.message);
        }
    }

    stopJob(jobId) {
        const job = this.jobs.get(jobId);
        if (!job || !job.worker) return;

        job.worker.terminate();
        job.worker = null;
        super.stopJob(jobId);
    }

    pauseJob(jobId) {
        const job = this.jobs.get(jobId);
        if (!job || !job.worker) return;

        job.worker.postMessage({ type: 'pause' });
        super.pauseJob(jobId);
    }

    resumeJob(jobId) {
        const job = this.jobs.get(jobId);
        if (!job || !job.worker) return;

        job.worker.postMessage({ type: 'resume' });
        super.resumeJob(jobId);
    }
}

export default NodeWorkerJobManager;