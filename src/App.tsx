import React, { useState } from 'react';
import RecordingScreen from './components/RecordingScreen';
import { VideoEditor } from './components/VideoEditor';
import { ThemeProvider, createTheme } from '@mui/material';

// Interface for recording data
interface RecordingData {
  blob: Blob;
  url: string;
  zoomEvents?: { timestamp: number; x: number; y: number; }[];
}

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2563eb',
    },
    secondary: {
      main: '#4f46e5',
    },
    background: {
      default: '#121212',
      paper: '#1c1c1c',
    },
  },
});

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'recording' | 'editing'>('recording');
  const [recordingData, setRecordingData] = useState<RecordingData | null>(null);

  const handleRecordingComplete = (blob: Blob, zoomEvents: { timestamp: number; x: number; y: number; }[] = []) => {
    const url = URL.createObjectURL(blob);
    setRecordingData({ blob, url, zoomEvents });
    setCurrentScreen('editing');
  };

  const handleBackToRecording = () => {
    if (recordingData) {
      URL.revokeObjectURL(recordingData.url);
    }
    setRecordingData(null);
    setCurrentScreen('recording');
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div style={{ width: '100%', height: '100vh', backgroundColor: '#121212' }}>
        {currentScreen === 'recording' ? (
          <RecordingScreen onRecordingComplete={handleRecordingComplete} />
        ) : (
          recordingData && (
            <VideoEditor
              videoSrc={recordingData.url}
              onBack={handleBackToRecording}
              zoomEvents={recordingData.zoomEvents}
            />
          )
        )}
        
        {/* Test button - Remove this in production */}
        {currentScreen === 'recording' && (
          <button 
            style={{ 
              position: 'fixed', 
              bottom: '20px', 
              right: '20px', 
              padding: '10px 20px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              zIndex: 1000
            }}
            onClick={() => {
              // Create a fake recording for testing
              const videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
              const videoBlob = new Blob([Buffer.from(videoUrl, 'base64')]);
              handleRecordingComplete(videoBlob);
            }}
          >
            Test Editor
          </button>
        )}
      </div>
    </ThemeProvider>
  );
};

export default App; 