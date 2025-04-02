import React from 'react';

const TestComponent: React.FC = () => {
  console.log('TestComponent rendering');
  
  return (
    <div style={{
      backgroundColor: '#ff0000',
      color: '#ffffff',
      padding: '20px',
      margin: '20px',
      borderRadius: '8px',
      textAlign: 'center',
      fontSize: '24px'
    }}>
      <h1>Test Component</h1>
      <p>If you can see this, rendering is working! 🎉</p>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
};

export default TestComponent; 