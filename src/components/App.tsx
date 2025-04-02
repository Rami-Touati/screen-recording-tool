import React, { useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import RecordingPage from './pages/RecordingPage';
import SettingsPage from './pages/SettingsPage';
import PreviewPage from './pages/PreviewPage';
import TestComponent from './TestComponent';
import ErrorBoundary from './ErrorBoundary';

const App: React.FC = () => {
  const location = useLocation();
  
  useEffect(() => {
    console.log('App component mounted');
    console.log('Current route:', location.pathname);
    return () => console.log('App component unmounted');
  }, [location]);

  console.log('App component rendering');

  return (
    <ErrorBoundary>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Screen Recorder
            </Typography>
            <Button color="inherit" component={Link} to="/">
              Record
            </Button>
            <Button color="inherit" component={Link} to="/preview">
              Preview
            </Button>
            <Button color="inherit" component={Link} to="/settings">
              Settings
            </Button>
            <Button color="inherit" component={Link} to="/test">
              Test
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<RecordingPage />} />
              <Route path="/preview" element={<PreviewPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/test" element={<TestComponent />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </Container>
      </Box>
    </ErrorBoundary>
  );
};

export default App; 