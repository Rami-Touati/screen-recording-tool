import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, IconButton, Paper, Typography, Slider, Grid } from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Videocam as CameraIcon,
  VideocamOff as CameraOffIcon,
  Settings as SettingsIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { recordingService } from '../../services/recordingService';

interface RecordingState {
  isRecording: boolean;
  selectedSource: 'screen' | 'camera';
  selectedAudio: 'default' | 'none';
  cameraEnabled: boolean;
  resolution: {
    width: number;
    height: number;
  };
  fps: number;
  zoomLevel: number;
}

const RecordingPage: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    selectedSource: 'screen',
    selectedAudio: 'default',
    cameraEnabled: false,
    resolution: {
      width: 1920,
      height: 1080,
    },
    fps: 30,
    zoomLevel: 1,
  });

  const handleStartRecording = async () => {
    try {
      await recordingService.startRecording({
        videoSource: recordingState.selectedSource,
        audioSource: recordingState.selectedAudio,
        cameraEnabled: recordingState.cameraEnabled,
        resolution: recordingState.resolution,
        fps: recordingState.fps,
      });
      setRecordingState(prev => ({ ...prev, isRecording: true }));
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const handleStopRecording = async () => {
    try {
      const blob = await recordingService.stopRecording();
      // Handle the recorded blob (e.g., save to file or preview)
      navigate('/preview', { state: { recording: blob } });
      setRecordingState(prev => ({ ...prev, isRecording: false }));
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const toggleCamera = () => {
    setRecordingState(prev => ({
      ...prev,
      cameraEnabled: !prev.cameraEnabled,
    }));
  };

  const handleZoomChange = (event: Event, newValue: number | number[]) => {
    setRecordingState(prev => ({
      ...prev,
      zoomLevel: newValue as number,
    }));
  };

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Screen Recorder</Typography>
        <IconButton onClick={() => navigate('/settings')}>
          <SettingsIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              flex: 1,
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Preview
            </Typography>
            <Box
              sx={{
                flex: 1,
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 1,
                bgcolor: 'background.default',
              }}
            >
              <video
                ref={videoRef}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  transform: `scale(${recordingState.zoomLevel})`,
                }}
                autoPlay
                muted
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Controls
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                color={recordingState.isRecording ? 'error' : 'primary'}
                onClick={recordingState.isRecording ? handleStopRecording : handleStartRecording}
                fullWidth
              >
                {recordingState.isRecording ? 'Stop Recording' : 'Start Recording'}
              </Button>

              <IconButton
                color={recordingState.cameraEnabled ? 'primary' : 'default'}
                onClick={toggleCamera}
              >
                {recordingState.cameraEnabled ? <CameraIcon /> : <CameraOffIcon />}
              </IconButton>

              <Box sx={{ width: 200, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ZoomOutIcon />
                <Slider
                  value={recordingState.zoomLevel}
                  onChange={handleZoomChange}
                  min={1}
                  max={3}
                  step={0.1}
                  valueLabelDisplay="auto"
                />
                <ZoomInIcon />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RecordingPage; 