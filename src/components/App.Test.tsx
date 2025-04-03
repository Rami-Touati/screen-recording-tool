import React, { useEffect, useState } from 'react';

const AppTest: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    console.log('AppTest mounted');
    setMounted(true);
    
    return () => {
      console.log('AppTest unmounted');
    };
  }, []);

  console.log('AppTest rendering, mounted:', mounted);
  
  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ color: '#00ff00' }}>Test Component</h1>
      <p style={{ color: '#ffffff' }}>
        Component mounted: {mounted ? 'Yes' : 'No'}
      </p>
      <p style={{ color: '#ffffff' }}>
        Time: {new Date().toLocaleTimeString()}
      </p>
      <div style={{ marginTop: 20, padding: 10, background: '#333' }}>
        <pre style={{ color: '#00ff00' }}>
          {JSON.stringify({
            nodeVersion: process.versions.node,
            chromeVersion: process.versions.chrome,
            electronVersion: process.versions.electron,
            platform: process.platform,
            arch: process.arch
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default AppTest;
