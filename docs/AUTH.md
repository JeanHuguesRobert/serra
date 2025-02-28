# Authentication Guide

## Overview
Serra uses GitHub OAuth for authentication. This allows users to securely log in using their GitHub accounts and manage their dashboards.

## Setup

1. Create a GitHub OAuth App:
   - Go to GitHub Settings > Developer Settings > OAuth Apps > New OAuth App
   - Set Homepage URL to your application URL (e.g., `http://localhost:5173`)
   - Set Authorization callback URL to `http://localhost:5173/callback`

2. Configure Environment Variables:
   ```env
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   JWT_SECRET=your_jwt_secret
   ```

## API Endpoints

### Login
- **GET** `/api/auth/login`
- Redirects to GitHub OAuth login page
- No authentication required

### OAuth Callback
- **POST** `/api/auth/callback`
- Handles the GitHub OAuth callback
- Body: `{ code: string }`
- Returns: `{ user: Object, token: string }`

### Logout
- **POST** `/api/auth/logout`
- Requires authentication token in header
- Returns: `{ message: string }`

### Get User Info
- **GET** `/api/auth/user`
- Requires authentication token in header
- Returns: `{ user: Object }`

## Authentication Flow

1. User clicks login button
2. Application redirects to GitHub login
3. After successful GitHub login, user is redirected back with a code
4. Application exchanges code for access token
5. Access token is used to fetch user information
6. JWT token is generated and returned to client
7. Client stores JWT token for subsequent requests

## Security Considerations

- All sensitive routes require a valid JWT token
- Tokens expire after 24 hours
- Store environment variables securely
- Never commit sensitive credentials to version control