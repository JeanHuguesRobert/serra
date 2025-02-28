import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';
import AuthService from '../services/AuthService';

const AuthCallback = () => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get('code');

                if (!code) {
                    throw new Error('No code parameter found');
                }

                const success = await AuthService.handleCallback(code);
                if (success) {
                    navigate('/');
                } else {
                    throw new Error('Authentication failed');
                }
            } catch (err) {
                setError(err.message);
                setTimeout(() => navigate('/'), 3000);
            }
        };

        handleCallback();
    }, [navigate]);

    if (error) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
                <Typography color="error" variant="h6">
                    {error}
                </Typography>
                <Typography variant="body1">
                    Redirecting to home...
                </Typography>
            </Box>
        );
    }

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
            <CircularProgress />
            <Typography variant="h6" style={{ marginTop: 16 }}>
                Completing authentication...
            </Typography>
        </Box>
    );
};

export default AuthCallback;