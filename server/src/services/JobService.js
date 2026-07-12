import { NodeWorkerJobManager } from '@serra/core/jobs';
import { JobSubscriptionManager } from '@serra/core/services/JobSubscriptionManager';

class JobService {
    constructor() {
        this.jobManager = new NodeWorkerJobManager();
        this.subscriptionManager = new JobSubscriptionManager();
    }

    createJob(config) {
        const jobId = this.jobManager.createJob(config);
        this.jobManager.subscribeToJob(jobId, (status) => {
            this.subscriptionManager.notifyStatusChange(jobId, status);
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
        this.subscriptionManager.subscribeToJobStatus(jobId, clientId, callback);
    }

    unsubscribeFromJobStatus(jobId, clientId) {
        this.subscriptionManager.unsubscribeFromJobStatus(jobId, clientId);
    }
}

export default new JobService();