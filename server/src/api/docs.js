import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsDir = path.join(__dirname, '..', '..', '..', 'docs');

// Cache control middleware
const setCacheControl = (res) => {
  res.set('Cache-Control', 'no-cache');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
};

router.get('/*', async (req, res) => {
  try {
    const docPath = req.path;
    
    // Remove leading slash and handle root path
    const relativePath = docPath.startsWith('/') ? docPath.slice(1) : docPath;
    if (!relativePath) {
      return res.redirect('/api/docs/README.md');
    }

    // Security check: ensure the filename only contains safe characters
    if (!/^[\w\/-]+\.md$/.test(relativePath)) {
      return res.status(400).send('Invalid filename');
    }

    const filePath = path.join(docsDir, relativePath);
    
    // Security check: ensure the resolved path is within the docs directory
    if (!filePath.startsWith(docsDir)) {
      return res.status(403).send('Access denied');
    }

    const content = await fs.readFile(filePath, 'utf-8');
    const stats = await fs.stat(filePath);
    
    // Generate ETag based on content
    const etag = crypto.createHash('md5').update(content).digest('hex');
    
    // Check if client has a valid cached version
    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }

    // Set cache control headers
    setCacheControl(res);
    res.set('ETag', etag);
    res.set('Last-Modified', stats.mtime.toUTCString());
    
    res.type('text/markdown').send(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).send('Documentation file not found');
    } else {
      console.error('Error serving documentation:', error);
      res.status(500).send('Internal server error');
    }
  }
});

// Get list of available documentation files
router.get('/', async (req, res) => {
  try {
    const files = await fs.readdir(docsDir);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    
    // Set cache control headers
    setCacheControl(res);
    res.json(markdownFiles);
  } catch (error) {
    console.error('Error listing documentation files:', error);
    res.status(500).send('Internal server error');
  }
});

export default router;