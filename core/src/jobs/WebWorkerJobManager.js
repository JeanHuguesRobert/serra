import JobManager from './JobManager.js';

class WebWorkerJobManager extends JobManager {
    startJob(jobId) {
        const job = this.jobs.get(jobId);
        if (!job) throw new Error(`Job ${jobId} not found`);
        if (job.status === 'running') return;

        try {
            const worker = new Worker(job.config.workerUrl);

            worker.onmessage = (event) => {
                const { type, data } = event.data;
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
            };

            worker.onerror = (error) => {
                this._setJobError(jobId, error.message);
                worker.terminate();
            };

            job.worker = worker;
            job.worker.postMessage({
                type: 'start',
                config: job.config
            });

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

export default WebWorkerJobManager;