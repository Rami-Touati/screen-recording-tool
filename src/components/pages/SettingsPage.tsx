import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Button,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface Settings {
  resolution: {
    width: number;
    height: number;
  };
  fps: number;
  audioDevice: string;
  videoDevice: string;
  cameraPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  cameraSize: number;
  backgroundBlur: boolean;
  theme: 'light' | 'dark';
}

const defaultSettings: Settings = {
  resolution: {
    width: 1920,
    height: 1080,
  },
  fps: 30,
  audioDevice: 'default',
  videoDevice: 'default',
  cameraPosition: 'top-right',
  cameraSize: 200,
  backgroundBlur: true,
  theme: 'dark',
};

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const handleResolutionChange = (event: Event, newValue: number | number[]) => {
    const width = newValue as number;
    setSettings(prev => ({
      ...prev,
      resolution: {
        width,
        height: Math.round((width * 9) / 16), // Maintain 16:9 aspect ratio
      },
    }));
  };

  const handleFPSChange = (event: Event, newValue: number | number[]) => {
    setSettings(prev => ({
      ...prev,
      fps: newValue as number,
    }));
  };

  const handleCameraSizeChange = (event: Event, newValue: number | number[]) => {
    setSettings(prev => ({
      ...prev,
      cameraSize: newValue as number,
    }));
  };

  const handleSave = () => {
    // Save settings to local storage or electron store
    localStorage.setItem('recorderSettings', JSON.stringify(settings));
    navigate('/');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Recording Settings
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>Resolution</Typography>
              <Slider
                value={settings.resolution.width}
                onChange={handleResolutionChange}
                min={1280}
                max={3840}
                step={1280}
                marks
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}x${Math.round((value * 9) / 16)}`}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>Frame Rate (FPS)</Typography>
              <Slider
                value={settings.fps}
                onChange={handleFPSChange}
                min={15}
                max={60}
                step={15}
                marks
                valueLabelDisplay="auto"
              />
            </Box>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Audio Device</InputLabel>
              <Select
                value={settings.audioDevice}
                label="Audio Device"
                onChange={(e) => setSettings(prev => ({ ...prev, audioDevice: e.target.value }))}
              >
                <MenuItem value="default">Default</MenuItem>
                {/* Add more audio devices dynamically */}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Video Device</InputLabel>
              <Select
                value={settings.videoDevice}
                label="Video Device"
                onChange={(e) => setSettings(prev => ({ ...prev, videoDevice: e.target.value }))}
              >
                <MenuItem value="default">Default</MenuItem>
                {/* Add more video devices dynamically */}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Camera Overlay Settings
            </Typography>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Camera Position</InputLabel>
              <Select
                value={settings.cameraPosition}
                label="Camera Position"
                onChange={(e) => setSettings(prev => ({ ...prev, cameraPosition: e.target.value as Settings['cameraPosition'] }))}
              >
                <MenuItem value="top-right">Top Right</MenuItem>
                <MenuItem value="top-left">Top Left</MenuItem>
                <MenuItem value="bottom-right">Bottom Right</MenuItem>
                <MenuItem value="bottom-left">Bottom Left</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>Camera Size</Typography>
              <Slider
                value={settings.cameraSize}
                onChange={handleCameraSizeChange}
                min={100}
                max={400}
                step={50}
                marks
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}px`}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.backgroundBlur}
                  onChange={(e) => setSettings(prev => ({ ...prev, backgroundBlur: e.target.checked }))}
                />
              }
              label="Enable Background Blur"
              sx={{ mb: 3 }}
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Theme</InputLabel>
              <Select
                value={settings.theme}
                label="Theme"
                onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' }))}
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button variant="contained" onClick={handleSave}>
            Save Settings
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SettingsPage; 