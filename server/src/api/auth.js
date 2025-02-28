import express from 'express';
import { authService } from '../services/authService.js';

const router = express.Router();

/**
 * @route   GET /api/auth/login
 * @desc    Redirect to GitHub OAuth login
 * @access  Public
 */
router.get('/login', (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = process.env.GITHUB_REDIRECT_URI || 'http://localhost:5173/callback';
    const scope = 'repo user';
    
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    res.json({ url: githubAuthUrl });
});

/**
 * @route   POST /api/auth/callback
 * @desc    Handle GitHub OAuth callback
 * @access  Public
 */
router.post('/callback', async (req, res) => {
    try {
        const { code } = req.body;
        const authResult = await authService.authenticateGitHub(code);
        res.json(authResult);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authService.authenticateRequest.bind(authService), (req, res) => {
    // In a real application, you might want to invalidate the token on the server side
    // For now, we'll just send a success response - the client will remove the token
    res.json({ message: 'Logged out successfully' });
});

/**
 * @route   GET /api/auth/user
 * @desc    Get current user info
 * @access  Private
 */
router.get('/user', authService.authenticateRequest.bind(authService), (req, res) => {
    res.json({ user: req.user });
});

export default router;