import { Octokit } from '@octokit/rest';
import { Base64 } from 'js-base64';

class GitHubService {
    constructor() {
        this.octokit = null;
        this.token = null;
    }

    initialize(token) {
        this.token = token;
        this.octokit = new Octokit({ auth: token });
    }

    isInitialized() {
        return this.octokit !== null;
    }

    async listRepositories() {
        try {
            const response = await this.octokit.repos.listForAuthenticatedUser({
                sort: 'updated',
                per_page: 100
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch repositories: ${error.message}`);
        }
    }

    async listFiles(owner, repo, path = '') {
        try {
            const response = await this.octokit.repos.getContent({
                owner,
                repo,
                path
            });
            return Array.isArray(response.data) ? response.data : [response.data];
        } catch (error) {
            throw new Error(`Failed to fetch repository contents: ${error.message}`);
        }
    }

    async getDashboard(owner, repo, path) {
        try {
            const response = await this.octokit.repos.getContent({
                owner,
                repo,
                path
            });

            const content = Base64.decode(response.data.content);
            const dashboard = JSON.parse(content);
            return {
                dashboard,
                sha: response.data.sha
            };
        } catch (error) {
            throw new Error(`Failed to fetch dashboard from GitHub: ${error.message}`);
        }
    }

    async updateDashboard(owner, repo, path, content, sha, message = 'Update dashboard') {
        try {
            const response = await this.octokit.repos.createOrUpdateFileContents({
                owner,
                repo,
                path,
                message,
                content: Base64.encode(JSON.stringify(content, null, 2)),
                sha
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to update dashboard on GitHub: ${error.message}`);
        }
    }

    async validateDashboard(dashboard) {
        if (!dashboard.model) {
            throw new Error('Invalid dashboard: missing model');
        }
        if (!dashboard.model.vars) {
            throw new Error('Invalid dashboard: missing variables');
        }
        if (!dashboard.model.opt) {
            throw new Error('Invalid dashboard: missing options');
        }
    }
}

export default new GitHubService();