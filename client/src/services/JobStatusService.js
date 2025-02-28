import { WebWorkerJobManager } from '@serra/core/jobs';

class JobStatusService {
    static instance = null;
    
    constructor() {
        if (JobStatusService.instance) {
            return JobStatusService.instance;
        }
        this.jobManager = new WebWorkerJobManager();
        this.statusChangeCallbacks = [];
        JobStatusService.instance = this;
    }

    createJob(config) {
        const jobId = this.jobManager.createJob(config);
        this.jobManager.subscribeToJob(jobId, (status) => {
            this.notifyStatusChange(status);
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

    onStatusChange(callback) {
        this.statusChangeCallbacks.push(callback);
        return () => {
            const index = this.statusChangeCallbacks.indexOf(callback);
            if (index !== -1) {
                this.statusChangeCallbacks.splice(index, 1);
            }
        };
    }

    notifyStatusChange(status) {
        this.statusChangeCallbacks.forEach(callback => callback(status));
    }
}

export default new JobStatusService();