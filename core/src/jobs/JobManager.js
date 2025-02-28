import { Continuation } from '../utils/Continuation.js';

class JobManager {
    constructor() {
        this.jobs = new Map();
        this.jobCounter = 0;
    }

    createJob(config, continuation = null) {
        const jobId = ++this.jobCounter;
        const job = {
            id: jobId,
            status: 'created',
            config,
            startTime: null,
            endTime: null,
            progress: 0,
            error: null,
            worker: null,
            subscribers: new Set(),
            continuation: continuation instanceof Continuation ? continuation : null
        };

        this.jobs.set(jobId, job);
        return jobId;
    }

    _handleJobCompletion(jobId, result, error) {
        const job = this.jobs.get(jobId);
        if (!job) return;

        job.status = error ? 'failed' : 'completed';
        job.endTime = Date.now();
        job.error = error;

        // Execute continuation if present
        if (job.continuation) {
            try {
                job.continuation.execute(result, error);
            } catch (continuationError) {
                console.error('Continuation execution failed:', continuationError);
            }
        }

        this._notifySubscribers(jobId);
    }

    startJob(jobId) {
        const job = this.jobs.get(jobId);
        if (!job) throw new Error(`Job ${jobId} not found`);
        if (job.status === 'running') return;

        job.status = 'running';
        job.startTime = Date.now();
        job.error = null;
        this._notifySubscribers(jobId);

        // Implementation for starting actual worker will be added in platform-specific classes
    }

    stopJob(jobId) {
        const job = this.jobs.get(jobId);
        if (!job) throw new Error(`Job ${jobId} not found`);
        if (job.status !== 'running') return;

        job.status = 'stopped';
        job.endTime = Date.now();
        this._notifySubscribers(jobId);

        if (job.worker) {
            // Implementation for stopping worker will be added in platform-specific classes
        }
    }

    pauseJob(jobId) {
        const job = this.jobs.get(jobId);
        if (!job) throw new Error(`Job ${jobId} not found`);
        if (job.status !== 'running') return;

        job.status = 'paused';
        this._notifySubscribers(jobId);
    }

    resumeJob(jobId) {
        const job = this.jobs.get(jobId);
        if (!job) throw new Error(`Job ${jobId} not found`);
        if (job.status !== 'paused') return;

        job.status = 'running';
        this._notifySubscribers(jobId);
    }

    getJobStatus(jobId) {
        const job = this.jobs.get(jobId);
        if (!job) throw new Error(`Job ${jobId} not found`);

        return {
            id: job.id,
            status: job.status,
            progress: job.progress,
            startTime: job.startTime,
            endTime: job.endTime,
            error: job.error
        };
    }

    subscribeToJob(jobId, callback) {
        const job = this.jobs.get(jobId);
        if (!job) throw new Error(`Job ${jobId} not found`);

        job.subscribers.add(callback);
        return () => job.subscribers.delete(callback);
    }

    _notifySubscribers(jobId) {
        const job = this.jobs.get(jobId);
        if (!job) return;

        const status = this.getJobStatus(jobId);
        job.subscribers.forEach(callback => callback(status));
    }

    _updateJobProgress(jobId, progress) {
        const job = this.jobs.get(jobId);
        if (!job) return;

        job.progress = progress;
        this._notifySubscribers(jobId);
    }

    _setJobError(jobId, error) {
        const job = this.jobs.get(jobId);
        if (!job) return;

        job.error = error;
        job.status = 'error';
        job.endTime = Date.now();
        this._notifySubscribers(jobId);
    }
}

export default JobManager;