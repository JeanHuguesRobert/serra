import { AuthService, GitHubAuthProvider } from '@serra/core';
import GitHubService from './githubService';

class BrowserAuthService extends AuthService {
    constructor() {
        super();
        this.provider = null;
        this.accessToken = localStorage.getItem('github_access_token');
        
        if (this.accessToken) {
            this._setAuthState({
                authenticated: true,
                token: this.accessToken
            });
            
            // Initialize GitHub service with the token
            GitHubService.initialize(this.accessToken);
        }
    }

    initialize() {
        this.provider = new GitHubAuthProvider({
            clientId: import.meta.env.VITE_GITHUB_CLIENT_ID,
            redirectUri: window.location.origin + '/auth/callback',
            scope: 'repo'
        });
        
        return Promise.resolve();
    }

    login() {
        if (!this.provider) {
            throw new Error('Auth provider not initialized');
        }
        
        window.location.href = this.provider.getAuthorizationUrl();
        return Promise.resolve();
    }

    async handleCallback(code) {
        try {
            if (!this.provider) {
                await this.initialize();
            }
            
            // Exchange code for access token using a proxy server to avoid CORS issues
            const tokenExchange = async (code) => {
                const response = await fetch('http://localhost:3000/auth/github/callback', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ code })
                });

                if (!response.ok) {
                    throw new Error('Failed to exchange code for token');
                }

                return response.json();
            };
            
            const data = await this.provider.exchangeCodeForToken(code, tokenExchange);
            this.accessToken = data.access_token;
            localStorage.setItem('github_access_token', this.accessToken);

            // Initialize GitHub service with the new token
            GitHubService.initialize(this.accessToken);
            
            this._setAuthState({
                authenticated: true,
                token: this.accessToken
            });

            return true;
        } catch (error) {
            console.error('Authentication error:', error);
            return false;
        }
    }

    logout() {
        localStorage.removeItem('github_access_token');
        GitHubService.initialize(null);
        return super.logout();
    }

    getAccessToken() {
        return this.accessToken;
    }
}

export default new BrowserAuthService();