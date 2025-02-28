import jwt from 'jsonwebtoken';
import { Octokit } from '@octokit/rest';
import { AuthService } from '@serra/core';

class ServerAuthService extends AuthService {
    constructor() {
        super();
        this.secretKey = process.env.JWT_SECRET || 'your-secret-key';
        this.tokenExpiration = '24h';
    }

    async authenticateGitHub(code) {
        try {
            const response = await fetch('https://github.com/login/oauth/access_token', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    client_id: process.env.GITHUB_CLIENT_ID,
                    client_secret: process.env.GITHUB_CLIENT_SECRET,
                    code,
                })
            });

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error_description);
            }

            // Get user data from GitHub
            const octokit = new Octokit({ auth: data.access_token });
            const { data: userData } = await octokit.users.getAuthenticated();

            const user = {
                id: userData.id,
                login: userData.login,
                name: userData.name,
                email: userData.email,
                githubToken: data.access_token
            };

            const token = this.generateToken(user);
            
            this._setAuthState({
                authenticated: true,
                user,
                token
            });

            return {
                user,
                token
            };
        } catch (error) {
            throw new Error(`GitHub authentication failed: ${error.message}`);
        }
    }

    generateToken(user) {
        return jwt.sign(
            { 
                id: user.id,
                login: user.login,
                email: user.email
            },
            this.secretKey,
            { expiresIn: this.tokenExpiration }
        );
    }

    verifyToken(token) {
        try {
            return jwt.verify(token, this.secretKey);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    authenticateRequest(req, res, next) {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        try {
            const decoded = this.verifyToken(token);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ error: 'Invalid token' });
        }
    }
}

export const authService = new ServerAuthService();