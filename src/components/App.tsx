import React from 'react';
import '../styles/App.css';
import { AppRoutes } from '../Routes';

const App: React.FC = () => {
  console.log('App component rendering...');
  console.log('Window electron API available:', !!window.electron);
  console.log('Current URL:', window.location.href);
  console.log('Document ready state:', document.readyState);
  console.log('Timestamp:', new Date().toISOString());

  return (
    <AppRoutes />
  );
};

export default App;
  