import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Save as SaveIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { recordingService } from '../../services/recordingService';

interface PreviewState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  exportFormat: 'mp4' | 'gif';
  exportQuality: 'high' | 'medium' | 'low';
  isExporting: boolean;
}

const PreviewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [previewState, setPreviewState] = useState<PreviewState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    exportFormat: 'mp4',
    exportQuality: 'high',
    isExporting: false,
  });

  const recording = location.state?.recording as Blob | undefined;

  useEffect(() => {
    if (!recording) {
      navigate('/');
      return;
    }

    const videoUrl = URL.createObjectURL(recording);
    if (videoRef.current) {
      videoRef.current.src = videoUrl;
    }

    return () => {
      URL.revokeObjectURL(videoUrl);
    };
  }, [recording, navigate]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (previewState.isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPreviewState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setPreviewState(prev => ({
        ...prev,
        currentTime: videoRef.current?.currentTime || 0,
      }));
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setPreviewState(prev => ({
        ...prev,
        duration: videoRef.current?.duration || 0,
      }));
    }
  };

  const handleSeek = (event: Event, newValue: number | number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newValue as number;
      setPreviewState(prev => ({ ...prev, currentTime: newValue as number }));
    }
  };

  const handleExport = async () => {
    if (!recording) return;

    setPreviewState(prev => ({ ...prev, isExporting: true }));

    try {
      const outputPath = await window.electron.showSaveDialog({
        title: 'Save Recording',
        defaultPath: `recording-${new Date().toISOString()}.${previewState.exportFormat}`,
        filters: [
          {
            name: previewState.exportFormat === 'mp4' ? 'MP4 Video' : 'GIF',
            extensions: [previewState.exportFormat],
          },
        ],
      });

      if (outputPath) {
        if (previewState.exportFormat === 'mp4') {
          await recordingService.exportToMP4(recording, outputPath);
        } else {
          await recordingService.exportToGIF(recording, outputPath, {
            fps: previewState.exportQuality === 'high' ? 30 : previewState.exportQuality === 'medium' ? 20 : 10,
            loop: true,
          });
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setPreviewState(prev => ({ ...prev, isExporting: false }));
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Preview Recording</Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => navigate('/')}
        >
          Discard
        </Button>
      </Box>

      <Paper sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ flex: 1, position: 'relative', bgcolor: 'background.default', borderRadius: 1 }}>
          <video
            ref={videoRef}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={handlePlayPause}>
            {previewState.isPlaying ? <PauseIcon /> : <PlayIcon />}
          </IconButton>

          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography>{formatTime(previewState.currentTime)}</Typography>
            <Slider
              value={previewState.currentTime}
              onChange={handleSeek}
              max={previewState.duration}
              sx={{ flex: 1 }}
            />
            <Typography>{formatTime(previewState.duration)}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Export Format</InputLabel>
            <Select
              value={previewState.exportFormat}
              label="Export Format"
              onChange={(e) => setPreviewState(prev => ({ ...prev, exportFormat: e.target.value as 'mp4' | 'gif' }))}
            >
              <MenuItem value="mp4">MP4</MenuItem>
              <MenuItem value="gif">GIF</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Quality</InputLabel>
            <Select
              value={previewState.exportQuality}
              label="Quality"
              onChange={(e) => setPreviewState(prev => ({ ...prev, exportQuality: e.target.value as 'high' | 'medium' | 'low' }))}
            >
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={previewState.isExporting ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={handleExport}
            disabled={previewState.isExporting}
          >
            {previewState.isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PreviewPage; 