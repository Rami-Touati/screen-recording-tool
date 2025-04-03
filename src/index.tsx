import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './components/App';
import './index.css'; // Add global styles

// Add global error handler
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Global error:', { message, source, lineno, colno, error });
  return false;
};

// Add unhandled rejection handler
window.onunhandledrejection = (event) => {
  console.error('Unhandled promise rejection:', event.reason);
};

// Log initial load
console.log('🚀 Application starting...', {
  url: window.location.href,
  readyState: document.readyState,
  time: new Date().toISOString()
});

// Get root element
const rootElement = document.getElementById('root');
console.log('Root element found:', rootElement);

if (!rootElement) {
  throw new Error('Root element not found! Check if index.html has <div id="root"></div>');
}

// Create root and render
try {
  console.log('Creating React root...');
  const root = createRoot(rootElement);
  
  console.log('Rendering application...');
  root.render(
    <React.StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </React.StrictMode>
  );
  
  console.log('✅ Render complete');
} catch (error) {
  console.error('❌ Render failed:', error);
  
  // Show error in DOM
  rootElement.innerHTML = `
    <div style="padding: 20px; background: #ff0000; color: white; font-family: Arial;">
      <h1>Failed to start application</h1>
      <pre>${error instanceof Error ? error.message : String(error)}</pre>
    </div>
  `;
} 