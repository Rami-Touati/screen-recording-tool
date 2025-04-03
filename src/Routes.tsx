import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import RecordingUI from './components/RecordingUI';
import { VideoEditor } from './components/VideoEditor';

export const AppRoutes: React.FC = () => {
  const navigate = useNavigate();

  const handleRecordingComplete = (blob: Blob, zoomEvents: { timestamp: number; x: number; y: number; }[] = []) => {
    const url = URL.createObjectURL(blob);
    navigate('/edit', { state: { videoBlob: blob, videoUrl: url, zoomEvents } });
  };

  const handleBackToRecording = () => {
    navigate('/');
  };

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <RecordingUI onRecordingComplete={handleRecordingComplete} />
        } 
      />
      <Route 
        path="/edit" 
        element={
          <VideoEditor
            videoSrc=""  // This will be overridden by location state
            onBack={handleBackToRecording}
            zoomEvents={[]}  // This will be overridden by location state
          />
        } 
      />
    </Routes>
  );
}; 