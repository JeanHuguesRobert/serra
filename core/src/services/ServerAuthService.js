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
            return { user, token };
        } catch (error) {
            throw new Error(`GitHub authentication failed: ${error.message}`);
        }
    }

    generateToken(user) {
        return jwt.sign(user, this.secretKey, { expiresIn: this.tokenExpiration });
    }

    verifyToken(token) {
        try {
            return jwt.verify(token, this.secretKey);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    async refreshToken(token) {
        try {
            const user = this.verifyToken(token);
            return this.generateToken(user);
        } catch (error) {
            throw new Error('Token refresh failed');
        }
    }

    authenticateRequest(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                throw new Error('No authorization header');
            }

            const token = authHeader.split(' ')[1];
            const user = this.verifyToken(token);
            req.user = user;
            next();
        } catch (error) {
            res.status(401).json({ error: 'Authentication failed' });
        }
    }
}

// Create and export the singleton instance
const serverAuthService = new ServerAuthService();
export { ServerAuthService, serverAuthService };