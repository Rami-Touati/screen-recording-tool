import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from './components/App';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/index.css';

console.log('🚀 Starting application...');
console.log('Current location:', window.location.href);

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

const rootElement = document.getElementById('root');
console.log('📦 Root element found:', rootElement);

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = ReactDOM.createRoot(rootElement);
console.log('🌳 Created React root');

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <HashRouter>
          <App />
        </HashRouter>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

console.log('🎭 Rendered app to root'); 