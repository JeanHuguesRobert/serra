import React, { useState, useEffect } from 'react';
import { Container, CssBaseline, AppBar, Toolbar, Typography, Paper, Box, IconButton, Collapse } from '@mui/material';
import { socket } from './socket/socket.js';
import GitHubIcon from '@mui/icons-material/GitHub';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MenuIcon from '@mui/icons-material/Menu';
import BurgerMenu from './components/BurgerMenu';
import DashboardManager from './components/DashboardManager';
import ChatInterface from './components/ChatInterface';
import Documentation from './components/Documentation';
import { EngineProvider } from './contexts/EngineContext';
import EngineDashboard from './components/EngineDashboard';
import EngineFormula from './components/EngineFormula';

function App() {
  const [dashboardExpanded, setDashboardExpanded] = useState(true);
  const [documentationExpanded, setDocumentationExpanded] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [currentDashboard, setCurrentDashboard] = useState('first');

  useEffect(() => {
    socket.emit('request-dashboard', 'first');
  }, []);

  return (
    <EngineProvider initialDashboardId={currentDashboard}>
      <CssBaseline>
        <Container maxWidth={false} disableGutters sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AppBar position="static">
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
                onClick={(e) => setMenuAnchorEl(e.currentTarget)}
              >
                <MenuIcon />
              </IconButton>
              <BurgerMenu anchorEl={menuAnchorEl} onClose={() => setMenuAnchorEl(null)} />
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Serra
              </Typography>
            </Toolbar>
          </AppBar>

          <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper elevation={3}>
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">Dashboard</Typography>
                <IconButton onClick={() => setDashboardExpanded(!dashboardExpanded)}>
                  {dashboardExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={dashboardExpanded}>
                <Box sx={{ p: 2 }}>
                  <EngineDashboard dashboardId={currentDashboard} />
                  <EngineFormula dashboardId={currentDashboard} />
                  <DashboardManager onSelectDashboard={(id) => setCurrentDashboard(id)} />
                </Box>
              </Collapse>
            </Paper>

            <Paper elevation={3} sx={{ flex: 1 }}>
              <Box sx={{ p: 2 }}>
                <ChatInterface />
              </Box>
            </Paper>

            <Paper elevation={3}>
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">Documentation</Typography>
                <IconButton onClick={() => setDocumentationExpanded(!documentationExpanded)}>
                  {documentationExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={documentationExpanded}>
                <Box sx={{ p: 2 }}>
                  <Documentation />
                </Box>
              </Collapse>
            </Paper>
          </Box>

          <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
            <IconButton
              href="https://github.com/jeanhuguesrobert/serra"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
            >
              <GitHubIcon />
            </IconButton>
          </Box>
        </Container>
      </CssBaseline>
    </EngineProvider>
  );
}

export default App;