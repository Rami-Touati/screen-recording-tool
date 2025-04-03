import React, { useState, useEffect, useCallback } from 'react';
import { DesktopCapturerSource } from 'electron';
import { RecordingOptions } from '../types/electron';

interface RecordingScreenProps {
  onRecordingComplete: (blob: Blob) => void;
}

export const RecordingScreen: React.FC<RecordingScreenProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [sources, setSources] = useState<DesktopCapturerSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  useEffect(() => {
    // Get available screen sources when component mounts
    const getSources = async () => {
      try {
        const sources = await window.electron.desktopCapturer.getSources({ types: ['screen', 'window'] });
        setSources(sources);
      } catch (error) {
        console.error('Failed to get sources:', error);
      }
    };
    getSources();
  }, []);

  const startRecording = useCallback(async () => {
    if (!selectedSource) {
      alert('Please select a screen or window to record');
      return;
    }

    try {
      // Get the stream using the selected source
      const stream = await window.electron.getScreenStream(selectedSource);

      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp9'
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((chunks) => [...chunks, event.data]);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, {
          type: 'video/webm'
        });
        onRecordingComplete(blob);
        setRecordedChunks([]);
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please make sure you have granted screen capture permissions.');
    }
  }, [selectedSource, recordedChunks, onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  }, [mediaRecorder]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ marginBottom: '20px' }}>Screen Recorder</h1>
      
      {!isRecording && (
        <div style={{ marginBottom: '20px' }}>
          <h2>Select Source</h2>
          <select 
            value={selectedSource || ''} 
            onChange={(e) => setSelectedSource(e.target.value)}
            style={{
              padding: '8px',
              marginBottom: '10px',
              width: '300px'
            }}
          >
            <option value="">Choose a screen or window</option>
            {sources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        onClick={isRecording ? stopRecording : startRecording}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: isRecording ? '#dc3545' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>

      {isRecording && (
        <div style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#dc3545',
          color: 'white',
          borderRadius: '4px'
        }}>
          Recording in progress...
        </div>
      )}
    </div>
  );
};

export default RecordingScreen; 