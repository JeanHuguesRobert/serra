/**
 * Factory for creating the appropriate JobManager instance based on the runtime environment
 */
class JobManagerFactory {
    static createJobManager() {
        if (typeof window === 'undefined') {
            // Node.js environment
            const { NodeWorkerJobManager } = await import('./NodeWorkerJobManager.js');
            return new NodeWorkerJobManager();
        } else {
            // Browser environment
            const { WebWorkerJobManager } = await import('./WebWorkerJobManager.js');
            return new WebWorkerJobManager();
        }
    }
}

export default JobManagerFactory;