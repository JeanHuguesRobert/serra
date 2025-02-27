import React from 'react';
import { Box, Container } from '@mui/material';

const PageContainer = ({ children, maxWidth = 'lg', ...props }) => {
  return (
    <Container maxWidth={maxWidth}>
      <Box
        sx={{
          py: 3,
          minHeight: 'calc(100vh - 64px)', // Adjust for AppBar height
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.default'
        }}
        {...props}
      >
        {children}
      </Box>
    </Container>
  );
};

export default PageContainer;













