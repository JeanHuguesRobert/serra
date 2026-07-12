/**
 * Manages job status subscriptions across different implementations.
 */
export class JobSubscriptionManager {
    constructor() {
        this.statusChangeCallbacks = new Map();
    }

    /**
     * Subscribe to job status updates
     * @param {string} jobId - The ID of the job to subscribe to
     * @param {string} clientId - The ID of the client subscribing
     * @param {Function} callback - The callback to execute on status change
     */
    subscribeToJobStatus(jobId, clientId, callback) {
        if (!this.statusChangeCallbacks.has(jobId)) {
            this.statusChangeCallbacks.set(jobId, new Map());
        }
        this.statusChangeCallbacks.get(jobId).set(clientId, callback);
    }

    /**
     * Unsubscribe from job status updates
     * @param {string} jobId - The ID of the job to unsubscribe from
     * @param {string} clientId - The ID of the client unsubscribing
     */
    unsubscribeFromJobStatus(jobId, clientId) {
        if (this.statusChangeCallbacks.has(jobId)) {
            this.statusChangeCallbacks.get(jobId).delete(clientId);
        }
    }

    /**
     * Notify all subscribers of a job status change
     * @param {string} jobId - The ID of the job that changed status
     * @param {object} status - The new status
     */
    notifyStatusChange(jobId, status) {
        if (this.statusChangeCallbacks.has(jobId)) {
            this.statusChangeCallbacks.get(jobId).forEach(callback => callback(status));
        }
    }
}