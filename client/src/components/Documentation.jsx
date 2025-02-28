import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Box, IconButton } from '@mui/material';

function Documentation({ content }) {
  // Simplified to just display provided content
  return (
    <Box>
      <ReactMarkdown
        components={{
          a: ({ node, ...props }) => (
            <a {...props} style={{ color: '#1976d2', textDecoration: 'none' }} />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
}

export default Documentation;