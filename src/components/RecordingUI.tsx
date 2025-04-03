import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Paper, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Videocam, VideocamOff, Mic, MicOff, Stop, PlayArrow, ScreenShare } from '@mui/icons-material';

// Lazy-load FFmpeg to prevent impact on initial load time
let ffmpeg: FFmpeg | null = null;
const loadFFmpeg = async () => {
  if (ffmpeg) return ffmpeg;
  
  ffmpeg = new FFmpeg();
  
  try {
    // Load FFmpeg core
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript')
    });
    console.log('FFmpeg loaded successfully');
    return ffmpeg;
  } catch (error) {
    console.error('Failed to load FFmpeg:', error);
    return null;
  }
};

interface RecordingOption {
  id: string;
  label: string;
  icon?: string;
}

// Define MediaStream type for TypeScript
interface MediaStreamTrack {
  kind: string;
  label: string;
  stop: () => void;
}

// Define the recording options interface to match the preload.ts
interface RecordingOptions {
  videoSource?: string;
  audioSource?: string;
  cameraEnabled?: boolean;
  resolution?: { width: number; height: number };
  fps?: number;
  mode?: 'fullscreen' | 'custom' | 'window';
  includeAudio?: boolean;
}

// Define supported export formats
type ExportFormat = 'webm' | 'mp4' | 'gif';

interface ZoomEvent {
  timestamp: number;
  x: number;
  y: number;
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #4B0082 0%, #0000FF 100%)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    position: 'relative' as const,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '200px',
      height: '200px',
      background: 'linear-gradient(45deg, #FF69B4, #4169E1)',
      borderRadius: '50%',
      filter: 'blur(100px)',
      opacity: 0.5,
      zIndex: 0,
    },
  },
  content: {
    width: '100%',
    maxWidth: '800px',
    textAlign: 'center' as const,
    zIndex: 1,
    position: 'relative' as const,
  },
  title: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '1rem',
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: '1.25rem',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '3rem',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
  },
  shareButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '30px',
    padding: '1rem 2.5rem',
    color: 'white',
    fontSize: '1.125rem',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      transform: 'translateY(-2px)',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
    },
  },
  privacyNote: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.875rem',
    marginTop: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
};

interface RecordingUIProps {
  onRecordingComplete?: (blob: Blob, zoomEvents: ZoomEvent[]) => void;
}

export default function RecordingUI({ onRecordingComplete }: RecordingUIProps) {
  const [selectedMode, setSelectedMode] = useState<'fullscreen' | 'window'>('fullscreen');
  const [isRecording, setIsRecording] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('webm');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [selectedCamera, setSelectedCamera] = useState<string>('none');
  const [selectedMic, setSelectedMic] = useState<string>('none');
  const [cameraPosition, setCameraPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [quality, setQuality] = useState<'standard' | 'high' | 'ultra'>('high');
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [availableMics, setAvailableMics] = useState<MediaDeviceInfo[]>([]);
  const previewRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const cameraDivRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomCenter, setZoomCenter] = useState({ x: 0, y: 0 });
  const screenStreamRef = useRef<MediaStream | null>(null);
  const [zoomEvents, setZoomEvents] = useState<ZoomEvent[]>([]);
  const recordingStartTime = useRef<number>(0);
  const screenRef = useRef<HTMLDivElement>(null);
  
  // Load available devices on mount
  useEffect(() => {
    loadAvailableDevices();
    
    // Clean up camera preview when component unmounts
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Update camera preview when selection changes
  useEffect(() => {
    updateCameraPreview();
  }, [selectedCamera]);
  
  // Handle camera drag interactions
  useEffect(() => {
    const cameraElement = cameraDivRef.current;
    if (!cameraElement) return;
    
    let startX = 0;
    let startY = 0;
    let isDraggingLocal = false;
    
    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isDraggingLocal = true;
      startX = e.clientX - cameraPosition.x;
      startY = e.clientY - cameraPosition.y;
      cameraElement.style.cursor = 'grabbing';
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingLocal) return;
      e.preventDefault();
      
      const newX = e.clientX - startX;
      const newY = e.clientY - startY;
      
      // Keep within window bounds
      const container = cameraElement.parentElement;
      if (!container) return;
      
      const maxX = container.clientWidth - cameraElement.offsetWidth;
      const maxY = container.clientHeight - cameraElement.offsetHeight;
      
      setCameraPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };
    
    const handleMouseUp = () => {
      isDraggingLocal = false;
      cameraElement.style.cursor = 'grab';
    };
    
    // Add event listeners
    cameraElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    // Cleanup
    return () => {
      cameraElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [cameraPosition]);
  
  // Load available audio and video devices
  const loadAvailableDevices = async () => {
    try {
      // Request permissions first
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      setAvailableCameras(devices.filter(device => device.kind === 'videoinput'));
      setAvailableMics(devices.filter(device => device.kind === 'audioinput'));
      
      console.log('Available devices loaded:', { cameras: availableCameras, mics: availableMics });
    } catch (error) {
      console.error('Error loading available devices:', error);
    }
  };
  
  // Update camera preview based on selection
  const updateCameraPreview = async () => {
    // Stop any existing camera stream
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
    
    // Clear the video preview
    if (previewRef.current) {
      previewRef.current.srcObject = null;
    }
    
    // If no camera selected, return
    if (selectedCamera === 'none') {
      return;
    }
    
    try {
      // Start a new camera stream with the selected device
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          deviceId: { exact: selectedCamera },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      });
      
      // Set the preview
      if (previewRef.current) {
        previewRef.current.srcObject = stream;
        cameraStreamRef.current = stream;
      }
    } catch (error) {
      console.error('Error starting camera preview:', error);
    }
  };

  // Helper function to convert WebM to other formats using FFmpeg
  async function convertFormat(blob: Blob, outputFormat: ExportFormat): Promise<Blob> {
    if (outputFormat === 'webm') {
      return blob; // No conversion needed
    }

    try {
      setIsProcessing(true);
      setStatusMessage(`Converting to ${outputFormat.toUpperCase()}...`);
      
      console.log(`Starting conversion from WebM to ${outputFormat}...`);
      console.log(`Input blob size: ${blob.size} bytes, type: ${blob.type}`);
      
      // Load FFmpeg
      const ffmpeg = await loadFFmpeg();
      if (!ffmpeg) {
        throw new Error('Failed to load FFmpeg');
      }
      
      // Prepare input file
      setStatusMessage('Preparing for conversion...');
      setProgress(10);
      
      // Convert Blob to ArrayBuffer
      const inputBuffer = await blob.arrayBuffer();
      const inputUint8Array = new Uint8Array(inputBuffer);
      
      console.log(`Input buffer size: ${inputBuffer.byteLength} bytes`);
      
      try {
        // Write input file to FFmpeg filesystem
        console.log('Writing input file to FFmpeg filesystem...');
        await ffmpeg.writeFile('input.webm', inputUint8Array);
        setProgress(30);
        
        setStatusMessage(`Converting to ${outputFormat}...`);
        
        let outputFileName = '';
        
        console.log(`Starting conversion to ${outputFormat}...`);
        
        // Run appropriate FFmpeg command based on format
        if (outputFormat === 'mp4') {
          // For MP4: Use maximum compatibility settings
          console.log('Executing FFmpeg command for MP4 conversion...');
          
          await ffmpeg.exec([
            '-i', 'input.webm',
            '-c:v', 'libx264',     // H.264 codec for video
            '-preset', 'ultrafast', // Fastest encoding preset
            '-crf', '18',          // High quality (lower is better quality)
            '-maxrate', '20M',     // Maximum bitrate
            '-bufsize', '40M',     // Buffer size for rate control
            '-profile:v', 'high',  // High profile for better quality
            '-level', '4.2',       // Compatibility level
            '-c:a', 'aac',         // AAC codec for audio
            '-b:a', '320k',        // High audio bitrate
            '-ar', '48000',        // Audio sample rate
            '-pix_fmt', 'yuv420p', // Pixel format for compatibility
            '-movflags', '+faststart', // Optimize for web playback
            'output.mp4'
          ]);
          outputFileName = 'output.mp4';
          console.log('MP4 conversion command completed');
        } else if (outputFormat === 'gif') {
          // For GIF: Use simpler command for compatibility
          console.log('Executing FFmpeg command for GIF conversion...');
          // Single pass with scale and fps for better compatibility
          await ffmpeg.exec([
            '-i', 'input.webm',
            '-vf', 'fps=10,scale=640:-1:flags=lanczos',
            '-f', 'gif',
            'output.gif'
          ]);
          outputFileName = 'output.gif';
          console.log('GIF conversion command completed');
        }
        
        console.log(`Checking if output file ${outputFileName} exists...`);
        const files = await ffmpeg.listDir('/');
        console.log('Files in FFmpeg filesystem:', files);
        
        setProgress(90);
        
        // Read the output file
        console.log(`Reading output file: ${outputFileName}`);
        const outputData = await ffmpeg.readFile(outputFileName);
        console.log(`Output file read, size: ${typeof outputData === 'string' ? outputData.length : outputData.buffer.byteLength} bytes`);
        
        if (typeof outputData === 'string' || outputData.buffer.byteLength === 0) {
          throw new Error(`FFmpeg produced an empty or invalid file (${typeof outputData})`);
        }
        
        // Create a Blob from the output data
        const outputBlob = new Blob(
          [outputData],
          { type: outputFormat === 'mp4' ? 'video/mp4' : 'image/gif' }
        );
        
        console.log(`Output blob created, size: ${outputBlob.size} bytes, type: ${outputBlob.type}`);
        
        setStatusMessage('Conversion complete!');
        setProgress(100);
        
        return outputBlob;
      } catch (ffmpegError) {
        console.error('FFmpeg processing error:', ffmpegError);
        // Log FFmpeg logs if available
        try {
          const logs = await ffmpeg.readFile('ffmpeg.log');
          console.error('FFmpeg logs:', logs);
        } catch (e) {
          console.error('Could not read FFmpeg logs:', e);
        }
        throw new Error(`FFmpeg processing failed: ${ffmpegError}`);
      }
    } catch (error) {
      console.error('Error converting video:', error);
      setStatusMessage(`Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }

  const handleScreenClick = useCallback((e: MouseEvent) => {
    if (!isRecording) return;
    
    const currentTime = Date.now() - recordingStartTime.current;
    
    // Get click position relative to the screen
    const rect = screenRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const zoomEvent: ZoomEvent = {
      timestamp: currentTime,
      x,
      y
    };
    
    setZoomEvents(prev => [...prev, zoomEvent]);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      setZoomEvents([]); // Reset zoom events
      recordingStartTime.current = Date.now();
      chunksRef.current = [];

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          // @ts-ignore - displaySurface is a valid property for getDisplayMedia
          displaySurface: 'monitor'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000,
          channelCount: 2
        }
      });

      document.addEventListener('click', handleScreenClick);

      const mimeType = 'video/webm;codecs=vp9,opus';
      const mediaRecorder = new MediaRecorder(screenStream, {
        mimeType,
        videoBitsPerSecond: 5000000 // High quality
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(chunksRef.current, { type: 'video/webm;codecs=vp9,opus' });
          if (onRecordingComplete) {
            onRecordingComplete(blob, zoomEvents);
          }
          document.removeEventListener('click', handleScreenClick);
          screenStream.getTracks().forEach(track => track.stop());
        } catch (error) {
          console.error('Error handling recording completion:', error);
          alert('Failed to process recording. Please try again.');
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      alert('Failed to start recording. Please check your permissions and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      document.removeEventListener('click', handleScreenClick);
    }
  };

  // Add cleanup effect
  useEffect(() => {
    return () => {
      document.removeEventListener('click', handleScreenClick);
    };
  }, [handleScreenClick]);

  const recordingModes: RecordingOption[] = [
    { id: 'fullscreen', label: 'Full Screen' },
    { id: 'window', label: 'Window' }
  ];

  return (
    <Box sx={styles.container}>
      <Box 
        ref={screenRef}
        sx={{
          ...styles.content,
          position: 'relative',
          width: '100%',
          height: '100%'
        }}
      >
        {isRecording && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              pointerEvents: 'none',
              transform: isZoomed 
                ? `translate(${zoomCenter.x}px, ${zoomCenter.y}px) scale(1.5)`
                : 'none',
              transition: 'transform 0.3s ease-out',
              transformOrigin: 'center'
            }}
          >
            {/* Screen content will be shown here during recording */}
          </Box>
        )}
        <Typography sx={styles.title}>
          Create Beautiful Screen Recordings
          <br />
          without leaving your browser
        </Typography>
        <Typography sx={styles.subtitle}>
          100% Free – No installation or account needed.
        </Typography>
        <Box sx={styles.buttonContainer}>
          {!isRecording ? (
            <Button
              onClick={startRecording}
              sx={styles.shareButton}
              startIcon={<ScreenShare />}
            >
              Share Screen
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              sx={{
                ...styles.shareButton,
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(239, 68, 68, 0.3)',
                }
              }}
            >
              Stop Recording
            </Button>
          )}
        </Box>
        <Typography sx={styles.privacyNote}>
          🔒 Your recordings never leave your device
        </Typography>
      </Box>
    </Box>
  );
}

// Add the stopRecording function to the window object
declare global {
  interface Window {
    stopRecording?: () => void;
  }
} 