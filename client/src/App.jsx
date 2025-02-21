import React from 'react';
import { Container, CssBaseline, AppBar, Toolbar, Typography, Grid, Paper } from '@mui/material';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import Documentation from './components/Documentation';

function App() {
  return (
    <CssBaseline>
      <Container maxWidth={false} disableGutters>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Serra
            </Typography>
          </Toolbar>
        </AppBar>
        <Grid container spacing={2} sx={{ p: 2 }}>
          <Grid item xs={12} md={8}>
            <Dashboard />
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
              <Documentation />
            </Paper>
            <Paper elevation={3} sx={{ p: 2 }}>
              <ChatInterface />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </CssBaseline>
  );
}

export default App;