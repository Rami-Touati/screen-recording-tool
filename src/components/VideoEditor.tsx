import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Typography, 
  Slider, 
  IconButton, 
          TextField,
          Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  LinearProgress
} from '@mui/material';
import { styled, alpha } from '@mui/system';
import { 
  ArrowBack,
  ZoomIn,
  Crop,
  TextFields,
  Save,
  PlayArrow,
  Pause,
  Settings, 
  Edit as EditIcon
} from '@mui/icons-material';
import { videoProcessor } from '../utils/videoProcessing';
import { DialogProps, ModalProps } from '@mui/material';
import GIF from 'gif.js';

interface ZoomEvent {
  timestamp: number;
  x: number;
  y: number;
}

interface VideoEditorProps {
  videoSrc: string;
  onBack: () => void;
  zoomEvents?: ZoomEvent[];
}

interface ZoomRegion {
  startTime: number;
  endTime: number;
  scale: number;
}

interface TextOverlay {
  text: string;
  position: { x: number; y: number };
  startTime: number;
  endTime: number;
  style: {
    fontSize: number;
    color: string;
    backgroundColor: string;
    fontWeight: string;
    fontFamily: string;
  };
}

interface CropSettings {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ExportSettings {
  format: 'mp4' | 'webm' | 'gif';
  quality: 'high' | 'medium' | 'low';
  resolution: '1080p' | '720p' | '480p';
}

const EditorContainer = styled(Box)({
  width: '100vw',
  height: '100vh',
  background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
});

const Header = styled(Box)({
  padding: '16px 24px',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  minHeight: '64px'
});

const MainContent = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  padding: '24px',
  height: 'calc(100vh - 64px)',
  overflow: 'hidden'
});

const EditorLayout = styled(Box)({
  display: 'flex',
  gap: '24px',
  height: '100%'
});

// Create a type for the VideoContainer props
interface VideoContainerProps {
  currentZoom: { scale: number; x: number; y: number } | null;
}

// Create the VideoContainer styled component with props
const VideoContainer = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  height: '100%'
});

const VideoWrapper = styled(Box)({
  flex: 1,
  position: 'relative',
  background: 'rgba(0, 0, 0, 0.4)',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(8px)',
  '& video': {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  }
});

const TimelineContainer = styled(Box)({
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(10px)',
  borderRadius: '12px',
  padding: '16px',
  border: '1px solid rgba(255, 255, 255, 0.1)'
});

const TimelineTrack = styled(Box)({
  position: 'relative',
  height: '64px',
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '8px',
  marginTop: '8px',
  cursor: 'pointer',
  overflow: 'hidden'
});

const TimelineRegion = styled(Box)<{ type: 'zoom' | 'text' | 'crop', active?: boolean }>(({ type, active }) => ({
  position: 'absolute',
  height: '100%',
  background: type === 'zoom' 
    ? 'rgba(74, 144, 226, 0.3)' 
    : type === 'text' 
    ? 'rgba(126, 87, 194, 0.3)' 
    : 'rgba(67, 160, 71, 0.3)',
  border: `2px solid ${
    type === 'zoom' 
      ? '#4a90e2' 
      : type === 'text' 
      ? '#7e57c2' 
      : '#43a047'
  }`,
  borderRadius: '4px',
  transition: 'all 0.2s ease',
  '&:hover, &.active': {
    background: type === 'zoom' 
      ? 'rgba(74, 144, 226, 0.5)' 
      : type === 'text' 
      ? 'rgba(126, 87, 194, 0.5)' 
      : 'rgba(67, 160, 71, 0.5)',
  }
}));

const ToolButton = styled(Button)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  color: '#fff',
  padding: '8px 16px',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.1)',
  },
  '&.active': {
    background: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  }
}));

const SidePanel = styled(Box)({
  width: '300px',
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(10px)',
  borderRadius: '12px',
  padding: '16px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
});

const CustomSlider = styled(Slider)({
  color: '#4a90e2',
  '& .MuiSlider-thumb': {
    width: 16,
    height: 16,
    backgroundColor: '#fff',
    '&:hover, &.Mui-active': {
      boxShadow: '0 0 0 8px rgba(74, 144, 226, 0.16)',
    }
  },
  '& .MuiSlider-rail': {
    opacity: 0.32,
  }
});

const CropOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  cursor: 'crosshair',
});

const CropSelection = styled(Box)({
  position: 'absolute',
  border: '2px solid #4a90e2',
  background: 'rgba(74, 144, 226, 0.3)',
});

const ModalBackdrop = styled('div')({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: -1
});

const modalStyles = {
  '& .MuiDialog-paper': {
    backgroundColor: '#ffffff',
    color: '#000000',
    borderRadius: '8px',
    minWidth: '400px',
    padding: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    '& .MuiDialogTitle-root': {
      fontSize: '1.25rem',
      fontWeight: 600,
      padding: '16px',
      color: '#000000'
    },
    '& .MuiDialogContent-root': {
      padding: '16px',
      '& .MuiFormControl-root': {
        marginBottom: '16px',
        width: '100%',
        '& .MuiInputLabel-root': {
          color: '#000000'
        },
        '& .MuiSelect-select': {
          color: '#000000'
        },
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#ffffff',
          '& fieldset': {
            borderColor: 'rgba(0, 0, 0, 0.23)'
          }
        }
      }
    },
    '& .MuiDialogActions-root': {
      padding: '16px'
    }
  }
};

const DEFAULT_VIDEO_QUALITY = {
  fps: 60,
  bitrate: '32M',
  resolution: { width: 3840, height: 2160 } // 4K resolution
};

export const VideoEditor: React.FC<VideoEditorProps> = ({ videoSrc, onBack, zoomEvents = [] }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(videoSrc);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [projectTitle, setProjectTitle] = useState('Untitled Project');
  const [isRenamingProject, setIsRenamingProject] = useState(false);
  const [videoQuality, setVideoQuality] = useState(DEFAULT_VIDEO_QUALITY);
  const [showQualitySettings, setShowQualitySettings] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [isAddingText, setIsAddingText] = useState(false);
  const [newTextValue, setNewTextValue] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  const [zoomRegions, setZoomRegions] = useState<ZoomRegion[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isCropping, setIsCropping] = useState(false);
  const [cropSettings, setCropSettings] = useState<CropSettings | null>(null);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [processing, setProcessing] = useState(false);
  const [timelineHover, setTimelineHover] = useState<{ time: number; x: number } | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [newTextStyle, setNewTextStyle] = useState({
    fontSize: 24,
    color: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    fontWeight: 'normal',
    fontFamily: 'Arial'
  });
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'mp4',
    quality: 'high',
    resolution: '1080p'
  });
  const [currentZoom, setCurrentZoom] = useState<{ scale: number; x: number; y: number } | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const state = location.state as { videoBlob?: Blob; videoUrl?: string } | undefined;
    
    if (!state?.videoUrl && !state?.videoBlob && !videoSrc) {
      navigate('/');
      return;
    }

    // Clean up previous URL if it exists
    if (videoUrl && videoUrl !== videoSrc) {
      URL.revokeObjectURL(videoUrl);
    }

    // Set the video URL
    if (state?.videoUrl) {
      setVideoUrl(state.videoUrl);
    } else if (state?.videoBlob) {
      const url = URL.createObjectURL(state.videoBlob);
      setVideoUrl(url);
      // Force video element to load the new source
      if (videoRef.current) {
        videoRef.current.load();
      }
    } else if (videoSrc) {
      setVideoUrl(videoSrc);
    }

    // Cleanup function
    return () => {
      if (videoUrl && videoUrl !== videoSrc) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [location.state, navigate, videoSrc]);

  useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.src = videoUrl;
      videoRef.current.load();
    }
  }, [videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime || 0);
    };

    const handleLoadedMetadata = () => {
      if (isFinite(video.duration)) {
        setDuration(video.duration);
      } else {
        // If duration is not available immediately, try to get it when video is loaded
        video.addEventListener('loadeddata', () => {
          if (isFinite(video.duration)) {
            setDuration(video.duration);
          }
        }, { once: true });
      }
      video.style.display = 'block';
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', (e) => {
      console.error('Video error:', e);
      const videoElement = e.target as HTMLVideoElement;
      console.error('Video error details:', videoElement.error);
    });

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [videoUrl]);

  // Add zoom effect handling
  useEffect(() => {
    if (!videoRef.current || !zoomEvents.length) return;

    const video = videoRef.current;
    
    const handleTimeUpdate = () => {
      const currentTime = video.currentTime * 1000; // Convert to milliseconds
      
      // Find any zoom event that should be active
      const activeZoom = zoomEvents.find(event => {
        const startTime = event.timestamp;
        const endTime = startTime + 4000; // 4 seconds duration
        return currentTime >= startTime && currentTime <= endTime;
      });

      if (activeZoom) {
        const videoRect = video.getBoundingClientRect();
        const relativeX = (activeZoom.x / videoRect.width) * 100;
        const relativeY = (activeZoom.y / videoRect.height) * 100;
        
        setCurrentZoom({
          scale: 1.5,
          x: 50 - relativeX,
          y: 50 - relativeY
        });
      } else {
        setCurrentZoom(null);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [zoomEvents]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimelineChange = (_: Event, newValue: number | number[]) => {
    if (!videoRef.current || typeof newValue !== 'number' || !isFinite(newValue)) return;
    
    try {
      const clampedTime = Math.max(0, Math.min(newValue, duration));
      videoRef.current.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    } catch (error) {
      console.error('Error setting video time:', error);
    }
  };

  const handleRewind = () => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, currentTime - 5);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleFastForward = () => {
    if (!videoRef.current) return;
    const newTime = Math.min(duration, currentTime + 5);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const addZoomRegion = () => {
    if (!videoRef.current) return;
    const newRegion: ZoomRegion = {
      startTime: currentTime,
      endTime: Math.min(currentTime + 2, duration || 0),
      scale: 1.5,
    };
    setZoomRegions([...zoomRegions, newRegion]);
    setSelectedRegion(zoomRegions.length);
  };

  const startCropping = () => {
    setIsCropping(true);
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const getVideoDimensions = () => {
    if (!videoRef.current) return { width: 1, height: 1 };
    return {
      width: videoRef.current.videoWidth || 1,
      height: videoRef.current.videoHeight || 1
    };
  };

  const handleCropMouseDown = (e: React.MouseEvent) => {
    if (!videoRef.current) return;
    const rect = videoRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCropStart({ x, y });
    setCropSettings({ x, y, width: 0, height: 0 });
  };

  const handleCropMouseMove = (e: React.MouseEvent) => {
    if (!cropStart || !videoRef.current) return;
    const rect = videoRef.current.getBoundingClientRect();
    
    // Calculate current position as percentage of video dimensions
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Calculate width and height
    const width = Math.abs(currentX - cropStart.x);
    const height = Math.abs(currentY - cropStart.y);
    
    // Calculate top-left position
    const x = Math.min(currentX, cropStart.x);
    const y = Math.min(currentY, cropStart.y);
    
    // Ensure crop region stays within video bounds
    const boundedX = Math.max(0, Math.min(100, x));
    const boundedY = Math.max(0, Math.min(100, y));
    const boundedWidth = Math.min(width, 100 - boundedX);
    const boundedHeight = Math.min(height, 100 - boundedY);
    
    setCropSettings({
      x: boundedX,
      y: boundedY,
      width: boundedWidth,
      height: boundedHeight
    });
  };

  const handleCropMouseUp = () => {
    setCropStart(null);
  };

  const applyCrop = () => {
    if (!cropSettings || !videoRef.current) return;
    
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Calculate crop dimensions in actual pixels
    const cropX = (cropSettings.x / 100) * video.videoWidth;
    const cropY = (cropSettings.y / 100) * video.videoHeight;
    const cropWidth = (cropSettings.width / 100) * video.videoWidth;
    const cropHeight = (cropSettings.height / 100) * video.videoHeight;

    // Draw cropped region
    ctx.drawImage(
      video,
      cropX, cropY, cropWidth, cropHeight,  // Source rectangle
      0, 0, cropWidth, cropHeight           // Destination rectangle
    );

    // Convert to blob and create URL
    canvas.toBlob((blob) => {
      if (blob) {
        const newVideoUrl = URL.createObjectURL(blob);
        setVideoUrl(newVideoUrl);
        setCropSettings(null);
        setIsCropping(false);
      }
    }, 'video/mp4');
  };

  const handleTextDrag = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    const videoRect = videoRef.current?.getBoundingClientRect();
    if (!videoRect) return;

    const x = ((e.clientX - videoRect.left) / videoRect.width) * 100;
    const y = ((e.clientY - videoRect.top) / videoRect.height) * 100;

    // Ensure coordinates stay within bounds
    const boundedX = Math.max(0, Math.min(100, x));
    const boundedY = Math.max(0, Math.min(100, y));

    const newOverlays = [...textOverlays];
    newOverlays[index] = {
        ...newOverlays[index],
      position: { x: boundedX, y: boundedY }
    };
    setTextOverlays(newOverlays);
  };

  const handleAddText = () => {
    if (!newTextValue.trim()) return;
    
    const newOverlay: TextOverlay = {
      text: newTextValue,
      position: textPosition,
      startTime: currentTime,
      endTime: Math.min(currentTime + 5, duration),
      style: newTextStyle
    };
    
    setTextOverlays([...textOverlays, newOverlay]);
    setNewTextValue('');
    setIsAddingText(false);
  };

  const updateZoomRegion = (index: number, updates: Partial<ZoomRegion>) => {
    const newRegions = [...zoomRegions];
    newRegions[index] = { ...newRegions[index], ...updates };
    setZoomRegions(newRegions);
  };

  const formatTime = (time: number) => {
    if (!isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  const getResolutionDimensions = (resolution: string) => {
    switch (resolution) {
      case '1080p': return { width: 1920, height: 1080 };
      case '720p': return { width: 1280, height: 720 };
      case '480p': return { width: 854, height: 480 };
      default: return { width: 1920, height: 1080 };
    }
  };

  const exportVideo = async () => {
    if (!videoRef.current || !videoUrl) {
      alert('No video to export');
      return;
    }
    
    try {
      setExportProgress(0);
      const video = videoRef.current;
      
      // Wait for video metadata to load if needed
      if (!video.duration || !isFinite(video.duration)) {
        await new Promise((resolve) => {
          video.addEventListener('loadedmetadata', resolve, { once: true });
        });
      }

      // For GIF export
      if (exportSettings.format === 'gif') {
        const gif = new GIF({
          workers: 2,
          quality: 10,
          width: video.videoWidth,
          height: video.videoHeight,
          workerScript: '/gif.worker.js'
        });

        const frames = Math.floor(video.duration * 10); // 10 fps for GIF
        for (let i = 0; i < frames; i++) {
          video.currentTime = i * 0.1;
          await new Promise(resolve => { video.onseeked = resolve; });
          
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Failed to get canvas context');
          
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          gif.addFrame(ctx.getImageData(0, 0, canvas.width, canvas.height), { delay: 100 });
          
          setExportProgress((i / frames) * 100);
        }

        gif.on('finished', (blob: Blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${projectTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.gif`;
          a.click();
          URL.revokeObjectURL(url);
          setIsExporting(false);
          setExportProgress(100);
        });

        gif.render();
        return;
      }

      // For MP4/WebM export
      const supportedTypes = [
        'video/webm',
        'video/webm;codecs=vp8',
        'video/webm;codecs=vp9',
        'video/mp4',
        'video/mp4;codecs=h264',
        'video/x-matroska;codecs=h264'
      ];

      const mimeType = supportedTypes.find(type => MediaRecorder.isTypeSupported(type));
      if (!mimeType) {
        throw new Error('No supported video format found in your browser');
      }

      // Create a stream from the video element directly
      // @ts-ignore - captureStream is not in the TypeScript types but is supported
      const stream = video.captureStream();
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 8000000 // 8 Mbps for better compatibility
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${exportSettings.format}`;
        a.click();
        URL.revokeObjectURL(url);
        setIsExporting(false);
        setExportProgress(100);
      };

      // Record the entire video
      video.currentTime = 0;
      await new Promise(resolve => { video.onseeked = resolve; });
      
      mediaRecorder.start();
      video.play();

      const updateProgress = () => {
        if (!video.ended) {
          setExportProgress((video.currentTime / video.duration) * 100);
          requestAnimationFrame(updateProgress);
        }
      };
      updateProgress();

      video.onended = () => {
        mediaRecorder.stop();
        video.pause();
      };
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleTimelineMouseMove = (e: React.MouseEvent) => {
    if (!timelineRef.current || !duration) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x / rect.width) * duration;
    
    setTimelineHover({ time, x });
  };

  const handleTimelineMouseLeave = () => {
    setTimelineHover(null);
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current || !duration || !videoRef.current) return;
    
    try {
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const newTime = percentage * duration;
      
      // Ensure the time is finite and within bounds
      if (isFinite(newTime) && newTime >= 0 && newTime <= duration) {
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    } catch (error) {
      console.error('Error setting video time:', error);
    }
  };

  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (!videoRef.current || isCropping) return;
    
    const video = videoRef.current;
    const rect = video.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Add zoom event
    const newZoomEvent: ZoomEvent = {
      timestamp: currentTime * 1000, // Convert to milliseconds
      x,
      y
    };
    
    // Update zoom events
    const updatedZoomEvents = [...zoomEvents, newZoomEvent];
    
    // Apply zoom effect
    const relativeX = (x / rect.width) * 100;
    const relativeY = (y / rect.height) * 100;
    
    setCurrentZoom({
      scale: 1.5,
      x: 50 - relativeX,
      y: 50 - relativeY
    });
    
    // Reset zoom after 4 seconds
    setTimeout(() => {
      setCurrentZoom(null);
    }, 4000);
  };

  if (!videoUrl) {
    return null;
  }

  return (
    <EditorContainer>
      <Header>
        <IconButton onClick={handleBack} sx={{ color: 'white' }}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">{projectTitle}</Typography>
          <IconButton 
            size="small" 
            sx={{ color: 'white' }}
            onClick={() => setIsRenamingProject(true)}
          >
            <EditIcon />
          </IconButton>
        </Box>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 2 }}>
          <ToolButton
            startIcon={<Settings />}
            onClick={() => setShowQualitySettings(true)}
          >
            Quality Settings
          </ToolButton>
          <ToolButton
            startIcon={<Save />}
            onClick={() => setIsExporting(true)}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export Video'}
          </ToolButton>
        </Box>
      </Header>

      <MainContent>
        <EditorLayout>
          <VideoContainer>
            <VideoWrapper>
              <div 
                ref={videoContainerRef}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden'
                }}
              >
                <video
                  ref={videoRef}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    transform: currentZoom 
                      ? `scale(${currentZoom.scale}) translate(${currentZoom.x}%, ${currentZoom.y}%)`
                      : 'none',
                    transition: 'transform 0.3s ease-out',
                    transformOrigin: 'center'
                  }}
                  onClick={handleVideoClick}
                  playsInline
                  onContextMenu={(e) => e.preventDefault()}
                  onLoadedData={(e) => {
                    const video = e.currentTarget;
                    if (isFinite(video.duration)) {
                      setDuration(video.duration);
                    }
                  }}
                />
                {isCropping && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      cursor: 'crosshair'
                    }}
                    onMouseDown={handleCropMouseDown}
                    onMouseMove={handleCropMouseMove}
                    onMouseUp={handleCropMouseUp}
                    onMouseLeave={handleCropMouseUp}
                  >
                    {cropSettings && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: `${cropSettings.x}%`,
                          top: `${cropSettings.y}%`,
                          width: `${cropSettings.width}%`,
                          height: `${cropSettings.height}%`,
                          border: '2px solid #4a90e2',
                          backgroundColor: 'rgba(74, 144, 226, 0.2)',
                          pointerEvents: 'none'
                        }}
                      />
                    )}
                  </Box>
                )}
                {textOverlays.map((overlay, index) => (
                  <Box
                    key={index}
                    component="div"
                    sx={{
                      position: 'absolute',
                      padding: '8px',
                      borderRadius: '4px',
                      cursor: 'move',
                      left: `${overlay.position.x}%`,
                      top: `${overlay.position.y}%`,
                      display: currentTime >= overlay.startTime && currentTime <= overlay.endTime ? 'block' : 'none',
                      color: overlay.style.color,
                      backgroundColor: overlay.style.backgroundColor,
                      fontSize: `${overlay.style.fontSize}px`,
                      fontWeight: overlay.style.fontWeight,
                      fontFamily: overlay.style.fontFamily,
                      userSelect: 'none',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: '0 0 0 2px rgba(74, 144, 226, 0.5)'
                      }
                    }}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', index.toString());
                    }}
                    onDrag={(e) => handleTextDrag(index, e)}
                  >
                    {overlay.text}
                  </Box>
                ))}
              </div>
            </VideoWrapper>
            <TimelineContainer>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                mb: 1,
                px: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconButton 
                    onClick={handlePlayPause} 
                    sx={{ 
                      color: 'white',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    {isPlaying ? <Pause /> : <PlayArrow />}
                  </IconButton>
                  <Typography sx={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                  }}>
                    {formatTime(currentTime)}
                  </Typography>
                </Box>
                <Typography sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem'
                }}>
                  {duration ? formatTime(duration) : '0:00'}
                </Typography>
              </Box>

              <TimelineTrack
                ref={timelineRef}
                onMouseMove={handleTimelineMouseMove}
                onMouseLeave={handleTimelineMouseLeave}
                onClick={handleTimelineClick}
                sx={{
                  '&:hover': {
                    '& .timeline-progress': {
                      background: 'rgba(74, 144, 226, 0.4)'
                    }
                  }
                }}
              >
                <Box
                  className="timeline-progress"
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${(currentTime / (duration || 1)) * 100}%`,
                    background: 'rgba(74, 144, 226, 0.3)',
                    pointerEvents: 'none',
                    transition: 'all 0.2s ease',
                    borderRight: '2px solid rgba(74, 144, 226, 0.8)'
                  }}
                />
                {zoomRegions.map((region, index) => (
                  <TimelineRegion
                    key={`zoom-${index}`}
                    type="zoom"
                    active={selectedRegion === index}
                    sx={{
                      left: `${(region.startTime / duration) * 100}%`,
                      width: `${((region.endTime - region.startTime) / duration) * 100}%`
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRegion(index);
                    }}
                  />
                ))}
                {timelineHover && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: timelineHover.x,
                      top: '-24px',
                      transform: 'translateX(-50%)',
                      background: 'rgba(0, 0, 0, 0.8)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: 'white',
                      zIndex: 1
                    }}
                  >
                    {formatTime(timelineHover.time)}
                  </Box>
                )}
              </TimelineTrack>
            </TimelineContainer>
          </VideoContainer>
          <SidePanel>
            <Typography variant="h6">Edit Tools</Typography>
            
            <Stack spacing={2}>
              <ToolButton
                startIcon={<Crop />}
                onClick={startCropping}
                className={isCropping ? 'active' : ''}
                fullWidth
              >
                {isCropping ? 'Finish Crop' : 'Crop Video'}
              </ToolButton>
              
              <ToolButton
                startIcon={<ZoomIn />}
                onClick={addZoomRegion}
                fullWidth
              >
                Add Zoom Region
              </ToolButton>
              
              <ToolButton
                startIcon={<TextFields />}
                onClick={() => setIsAddingText(true)}
                fullWidth
              >
                Add Text
              </ToolButton>
            </Stack>

            {selectedRegion !== null && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Zoom Region Settings
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Scale: {zoomRegions[selectedRegion].scale}x
                </Typography>
                <CustomSlider
                  value={zoomRegions[selectedRegion].scale}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(_, value) => 
                    updateZoomRegion(selectedRegion, { scale: value as number })
                  }
                />
              </Box>
            )}
          </SidePanel>
        </EditorLayout>
      </MainContent>

      {/* Project Rename Dialog */}
      <Dialog
        open={isRenamingProject}
        onClose={() => setIsRenamingProject(false)}
        slots={{
          backdrop: () => <ModalBackdrop />
        }}
        sx={modalStyles}
      >
        <DialogTitle>Rename Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            fullWidth
            variant="outlined"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsRenamingProject(false)} sx={{ color: 'white' }}>
            Cancel
          </Button>
          <Button onClick={() => setIsRenamingProject(false)} sx={{ color: '#4a90e2' }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quality Settings Dialog */}
      <Dialog
        open={showQualitySettings}
        onClose={() => setShowQualitySettings(false)}
        slots={{
          backdrop: () => <ModalBackdrop />
        }}
        sx={modalStyles}
      >
        <DialogTitle>Video Quality Settings</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel>Resolution</InputLabel>
            <Select
              value={`${videoQuality.resolution.width}x${videoQuality.resolution.height}`}
              onChange={(e) => {
                const [width, height] = e.target.value.split('x').map(Number);
                setVideoQuality(prev => ({
                  ...prev,
                  resolution: { width, height }
                }));
              }}
            >
              <MenuItem value="3840x2160">4K Ultra HD (3840x2160)</MenuItem>
              <MenuItem value="2560x1440">2K QHD (2560x1440)</MenuItem>
              <MenuItem value="1920x1080">Full HD (1920x1080)</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Frame Rate</InputLabel>
            <Select
              value={videoQuality.fps}
              onChange={(e) => {
                setVideoQuality(prev => ({
                  ...prev,
                  fps: Number(e.target.value)
                }));
              }}
            >
              <MenuItem value={60}>60 FPS (Smooth)</MenuItem>
              <MenuItem value={30}>30 FPS (Standard)</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Bitrate</InputLabel>
            <Select
              value={videoQuality.bitrate}
              onChange={(e) => {
                setVideoQuality(prev => ({
                  ...prev,
                  bitrate: e.target.value as string
                }));
              }}
            >
              <MenuItem value="32M">32 Mbps (Ultra High Quality)</MenuItem>
              <MenuItem value="24M">24 Mbps (High Quality)</MenuItem>
              <MenuItem value="16M">16 Mbps (Standard Quality)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQualitySettings(false)} sx={{ color: '#64748B' }}>
            Cancel
          </Button>
          <Button 
            onClick={() => setShowQualitySettings(false)} 
            variant="contained"
            sx={{ 
              bgcolor: '#4a90e2',
              '&:hover': { bgcolor: '#357abd' }
            }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Text Overlay Dialog */}
      <Dialog
        open={isAddingText}
        onClose={() => setIsAddingText(false)}
        maxWidth="sm"
        fullWidth
        slots={{
          backdrop: () => <ModalBackdrop />
        }}
        sx={modalStyles}
      >
        <DialogTitle>Add Text Overlay</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              autoFocus
              margin="dense"
              label="Text"
              fullWidth
              variant="outlined"
              value={newTextValue}
              onChange={(e) => setNewTextValue(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }}
            />
            
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Font Family</InputLabel>
              <Select
                value={newTextStyle.fontFamily}
                onChange={(e) => setNewTextStyle(prev => ({ ...prev, fontFamily: e.target.value }))}
                sx={{ color: 'white' }}
              >
                <MenuItem value="Arial">Arial</MenuItem>
                <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                <MenuItem value="Courier New">Courier New</MenuItem>
                <MenuItem value="Georgia">Georgia</MenuItem>
                <MenuItem value="Verdana">Verdana</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Font Weight</InputLabel>
              <Select
                value={newTextStyle.fontWeight}
                onChange={(e) => setNewTextStyle(prev => ({ ...prev, fontWeight: e.target.value }))}
                sx={{ color: 'white' }}
              >
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="bold">Bold</MenuItem>
              </Select>
            </FormControl>

            <Box>
              <Typography gutterBottom>Font Size: {newTextStyle.fontSize}px</Typography>
              <Slider
                value={newTextStyle.fontSize}
                min={12}
                max={72}
                step={1}
                onChange={(_, value) => setNewTextStyle(prev => ({ ...prev, fontSize: value as number }))}
              />
            </Box>

            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Text Color</InputLabel>
              <Select
                value={newTextStyle.color}
                onChange={(e) => setNewTextStyle(prev => ({ ...prev, color: e.target.value }))}
                sx={{ color: 'white' }}
              >
                <MenuItem value="#ffffff">White</MenuItem>
                <MenuItem value="#000000">Black</MenuItem>
                <MenuItem value="#ff0000">Red</MenuItem>
                <MenuItem value="#00ff00">Green</MenuItem>
                <MenuItem value="#0000ff">Blue</MenuItem>
                <MenuItem value="#ffff00">Yellow</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Background Color</InputLabel>
              <Select
                value={newTextStyle.backgroundColor}
                onChange={(e) => setNewTextStyle(prev => ({ ...prev, backgroundColor: e.target.value }))}
                sx={{ color: 'white' }}
              >
                <MenuItem value="rgba(0, 0, 0, 0)">Transparent</MenuItem>
                <MenuItem value="rgba(0, 0, 0, 0.5)">Semi-transparent Black</MenuItem>
                <MenuItem value="rgba(255, 255, 255, 0.5)">Semi-transparent White</MenuItem>
                <MenuItem value="#000000">Black</MenuItem>
                <MenuItem value="#ffffff">White</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddingText(false)} sx={{ color: 'white' }}>
            Cancel
          </Button>
          <Button onClick={handleAddText} sx={{ color: '#4a90e2' }}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Crop Controls */}
      {isCropping && (
        <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={applyCrop}
            disabled={!cropSettings}
            sx={{
              backgroundColor: '#4a90e2',
              '&:hover': { backgroundColor: '#357abd' }
            }}
          >
            Apply Crop
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setIsCropping(false);
              setCropSettings(null);
            }}
            sx={{
              color: '#4a90e2',
              borderColor: '#4a90e2',
              '&:hover': {
                borderColor: '#357abd',
                color: '#357abd'
              }
            }}
          >
            Cancel
          </Button>
        </Box>
      )}

      {/* Export Dialog */}
      <Dialog
        open={isExporting}
        onClose={() => {
          setIsExporting(false);
          setExportProgress(0);
        }}
        slots={{
          backdrop: () => <ModalBackdrop />
        }}
        sx={modalStyles}
      >
        <DialogTitle>Export Video</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Format</InputLabel>
            <Select
              value={exportSettings.format}
              onChange={(e) => setExportSettings(prev => ({ 
                ...prev, 
                format: e.target.value as 'mp4' | 'webm' | 'gif'
              }))}
            >
              <MenuItem value="mp4">MP4 Video</MenuItem>
              <MenuItem value="webm">WebM Video</MenuItem>
              <MenuItem value="gif">Animated GIF</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Quality</InputLabel>
            <Select
              value={exportSettings.quality}
              onChange={(e) => setExportSettings(prev => ({ 
                ...prev, 
                quality: e.target.value as 'high' | 'medium' | 'low'
              }))}
            >
              <MenuItem value="high">High Quality</MenuItem>
              <MenuItem value="medium">Medium Quality</MenuItem>
              <MenuItem value="low">Low Quality</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Resolution</InputLabel>
            <Select
              value={exportSettings.resolution}
              onChange={(e) => setExportSettings(prev => ({ 
                ...prev, 
                resolution: e.target.value as '1080p' | '720p' | '480p'
              }))}
            >
              <MenuItem value="1080p">1080p (Full HD)</MenuItem>
              <MenuItem value="720p">720p (HD)</MenuItem>
              <MenuItem value="480p">480p (SD)</MenuItem>
            </Select>
          </FormControl>

          {exportProgress > 0 && (
            <Box sx={{ mt: 3 }}>
              <LinearProgress
                variant="determinate"
                value={exportProgress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#e5e7eb',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#4a90e2',
                    borderRadius: 3,
                  },
                }}
              />
              <Typography
                variant="body2"
                sx={{ 
                  color: '#1E293B', 
                  mt: 1, 
                  textAlign: 'center', 
                  fontSize: '14px' 
                }}
              >
                {Math.round(exportProgress)}% Complete
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsExporting(false);
              setExportProgress(0);
            }}
            sx={{ 
              color: '#64748B',
              '&:hover': { backgroundColor: '#f1f5f9' }
            }}
            disabled={exportProgress > 0 && exportProgress < 100}
          >
            Cancel
          </Button>
          <Button
            onClick={exportVideo}
            variant="contained"
            sx={{ 
              bgcolor: '#4a90e2',
              '&:hover': { bgcolor: '#357abd' }
            }}
            disabled={exportProgress > 0 && exportProgress < 100}
          >
            Start Export
          </Button>
        </DialogActions>
      </Dialog>
    </EditorContainer>
  );
};