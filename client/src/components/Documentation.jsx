import React, { useEffect, useState, useRef } from 'react';
import { Paper, Typography, Box, Divider, CircularProgress, List, ListItem, IconButton, Collapse } from '@mui/material';
import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { Link as RouterLink } from 'react-router-dom';
import { socket } from '../socket';
import { useDashboard } from '../contexts/DashboardContext';
import { LoadingWrapper } from './common/LoadingWrapper';
import { useLoading } from '../hooks/useLoading';
import PageContainer from './layout/PageContainer';

function Documentation({ filename = 'README.md' }) {
  const { isLoading, startLoading, stopLoading } = useLoading('documentation');
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [navigationStack, setNavigationStack] = useState([{ file: filename, content: '' }]);
  const fetchingRef = useRef(false);
  const etagRef = useRef('none');

  const currentDoc = navigationStack[navigationStack.length - 1]?.content || '';

  const handleBack = () => {
    if (navigationStack.length > 1) {
      setNavigationStack(prev => prev.slice(0, -1));
    }
  };

  const handleLinkClick = (e) => {
    if (e.target.tagName === 'A') {
      e.preventDefault();
      const href = e.target.getAttribute('href');
      if (href && href.endsWith('.md')) {
        // Remove 'docs/' prefix if it exists in the link
        const cleanPath = href.replace(/^docs\//, '');
        loadDocument(cleanPath);
        setNavigationStack(prev => [...prev, { file: cleanPath, content: '' }]);
      }
    }
  };

  const loadDocument = async (docFile) => {
    if (fetchingRef.current) return;
    
    try {
      fetchingRef.current = true;
      startLoading();
      
      // Remove any leading 'docs/' from the path
      const cleanPath = docFile.replace(/^docs\//, '');
      console.log('[Documentation] Loading document:', cleanPath);
      
      const response = await fetch(`/api/docs/${cleanPath}`);
      console.log('[Documentation] Response headers:', Object.fromEntries(response.headers));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const markdown = await response.text();
      // Update navigation stack with raw markdown
      setNavigationStack(prev => prev.map((item, idx) => 
        idx === prev.length - 1 ? { ...item, content: markdown } : item
      ));
      
      setError(null);
      console.log('[Documentation] Document loaded successfully');
    } catch (err) {
      console.error('[Documentation] Error loading document:', err);
      setError(err.message);
    } finally {
      stopLoading();
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    loadDocument(filename);
  }, [filename]);

  if (error) {
    return <div className="error">Error loading documentation: {error}</div>;
  }

  return (
    <PageContainer>
      {navigationStack.length > 1 && (
        <Box sx={{ mb: 2 }}>
          <IconButton onClick={handleBack} size="small">
            ← Back
          </IconButton>
        </Box>
      )}
      <LoadingWrapper loading={isLoading}>
        <Box onClick={handleLinkClick}>
          <ReactMarkdown
            components={{
              a: ({ node, ...props }) => (
                <a {...props} style={{ color: '#1976d2', textDecoration: 'none' }} />
              )
            }}
          >
            {currentDoc}
          </ReactMarkdown>
        </Box>
      </LoadingWrapper>
    </PageContainer>
  );
}

export default Documentation;