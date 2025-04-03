import React, { useState, useRef, useEffect } from 'react';
import { IconButton, Slider, Tooltip } from '@mui/material';

interface TimelineEditorProps {
  videoSrc: string;
  duration: number; // in seconds
  onTrimChange: (start: number, end: number) => void;
}

const TimelineEditor: React.FC<TimelineEditorProps> = ({ 
  videoSrc, 
  duration,
  onTrimChange 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [trimRange, setTrimRange] = useState<[number, number]>([0, duration]);
  const [isDragging, setIsDragging] = useState(false);
  const [markerPosition, setMarkerPosition] = useState(0);

  // Handle video time update
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setMarkerPosition((video.currentTime / duration) * 100);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [duration]);

  // Handle trim change
  useEffect(() => {
    onTrimChange(trimRange[0], trimRange[1]);
  }, [trimRange, onTrimChange]);

  const handleTrimChange = (event: Event, newValue: number | number[]) => {
    const range = newValue as number[];
    setTrimRange([range[0], range[1]]);
  };

  const handleZoomChange = (newZoom: number) => {
    setZoomLevel(newZoom);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const jumpToPosition = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    const newTime = position * duration;
    
    videoRef.current.currentTime = Math.max(0, Math.min(newTime, duration));
  };

  const timelineMarkers = Array.from({ length: Math.ceil(duration) + 1 }, (_, i) => (
    <div 
      key={i} 
      className="timeline-marker"
      style={{ 
        left: `${(i / duration) * 100}%`,
        height: i % 5 === 0 ? '12px' : '8px'
      }}
    >
      {i % 5 === 0 && (
        <span className="marker-label">{formatTime(i)}</span>
      )}
    </div>
  ));

  return (
    <div className="timeline-editor">
      <div className="video-preview">
        <video
          ref={videoRef}
          src={videoSrc}
          controls
          style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
        />
      </div>

      <div className="timeline-controls">
        <div className="zoom-controls">
          <button
            onClick={() => handleZoomChange(Math.max(1, zoomLevel - 0.5))}
            disabled={zoomLevel <= 1}
          >
            -
          </button>
          <span>{zoomLevel.toFixed(1)}x</span>
          <button
            onClick={() => handleZoomChange(Math.min(3, zoomLevel + 0.5))}
            disabled={zoomLevel >= 3}
          >
            +
          </button>
        </div>

        <div className="time-display">
          <span>{formatTime(currentTime)}</span>
          <span> / </span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div 
        className="timeline"
        style={{ 
          width: '100%', 
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <div 
          className="timeline-inner"
          style={{ 
            width: `${zoomLevel * 100}%`, 
            transform: `translateX(-${(zoomLevel - 1) * (markerPosition / zoomLevel)}%)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            height: '60px',
            position: 'relative',
            background: '#1a1a1a',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={jumpToPosition}
        >
          <div className="timeline-markers">
            {timelineMarkers}
          </div>
          
          <div className="trim-controls">
            <Slider
              value={trimRange}
              onChange={handleTrimChange}
              min={0}
              max={duration}
              step={0.01}
              valueLabelDisplay="auto"
              valueLabelFormat={formatTime}
              disableSwap
              sx={{
                '& .MuiSlider-thumb': {
                  width: '4px',
                  borderRadius: '2px',
                  height: '60px',
                  backgroundColor: '#ffb800',
                  '&:hover': {
                    boxShadow: '0 0 0 8px rgba(255, 184, 0, 0.16)'
                  }
                },
                '& .MuiSlider-track': {
                  height: '60px',
                  border: 'none',
                  backgroundColor: 'rgba(255, 184, 0, 0.2)'
                },
                '& .MuiSlider-rail': {
                  height: '60px',
                  backgroundColor: 'transparent'
                }
              }}
            />
          </div>
          
          <div 
            className="current-position-marker"
            style={{
              position: 'absolute',
              top: 0,
              left: `${markerPosition}%`,
              width: '2px',
              height: '100%',
              backgroundColor: '#ff3860',
              zIndex: 10
            }}
          />
        </div>
      </div>

      <div className="edit-actions">
        <button className="add-text-btn">Add Text</button>
        <button className="add-overlay-btn">Add Overlay</button>
      </div>

      <style>{`
        .timeline-editor {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
          background-color: #1c1c1c;
          border-radius: 8px;
        }
        
        .preview-container {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          background-color: #000;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .preview-video {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        
        .timeline-container {
          position: relative;
          width: 100%;
          height: 60px;
          background-color: #333;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .timeline-progress {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background-color: #2563eb;
          opacity: 0.3;
        }
        
        .timeline-handle {
          position: absolute;
          top: 0;
          width: 4px;
          height: 100%;
          background-color: #2563eb;
          cursor: ew-resize;
        }
        
        .timeline-handle::before {
          content: '';
          position: absolute;
          top: 0;
          left: -4px;
          right: -4px;
          bottom: 0;
        }
        
        .timeline-handle.start {
          left: 0;
        }
        
        .timeline-handle.end {
          right: 0;
        }
        
        .timeline-marker {
          position: absolute;
          top: 0;
          width: 2px;
          height: 100%;
          background-color: #666;
        }
        
        .timeline-marker.current {
          background-color: #2563eb;
        }
        
        .timeline-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .zoom-controls {
          display: flex;
          gap: 8px;
        }
        
        .zoom-button {
          padding: 4px 8px;
          background-color: #333;
          border: none;
          border-radius: 4px;
          color: white;
          cursor: pointer;
        }
        
        .zoom-button:hover {
          background-color: #444;
        }
        
        .zoom-button.active {
          background-color: #2563eb;
        }
        
        .add-overlay-button {
          padding: 4px 8px;
          background-color: #333;
          border: none;
          border-radius: 4px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .add-overlay-button:hover {
          background-color: #444;
        }
      `}</style>
    </div>
  );
};

export default TimelineEditor; 