const { NodeWorkerJobManager } = require('@serra/core/jobs');

class JobService {
    constructor() {
        this.jobManager = new NodeWorkerJobManager();
        this.statusChangeCallbacks = new Map();
    }

    createJob(config) {
        const jobId = this.jobManager.createJob(config);
        this.jobManager.subscribeToJob(jobId, (status) => {
            this.notifyStatusChange(jobId, status);
        });
        return jobId;
    }

    startJob(jobId) {
        this.jobManager.startJob(jobId);
    }

    stopJob(jobId) {
        this.jobManager.stopJob(jobId);
    }

    pauseJob(jobId) {
        this.jobManager.pauseJob(jobId);
    }

    resumeJob(jobId) {
        this.jobManager.resumeJob(jobId);
    }

    getJobStatus(jobId) {
        return this.jobManager.getJobStatus(jobId);
    }

    subscribeToJobStatus(jobId, clientId, callback) {
        if (!this.statusChangeCallbacks.has(jobId)) {
            this.statusChangeCallbacks.set(jobId, new Map());
        }
        this.statusChangeCallbacks.get(jobId).set(clientId, callback);
    }

    unsubscribeFromJobStatus(jobId, clientId) {
        if (this.statusChangeCallbacks.has(jobId)) {
            this.statusChangeCallbacks.get(jobId).delete(clientId);
        }
    }

    notifyStatusChange(jobId, status) {
        if (this.statusChangeCallbacks.has(jobId)) {
            this.statusChangeCallbacks.get(jobId).forEach(callback => callback(status));
        }
    }
}

module.exports = new JobService();