import React, { useState } from 'react';
import { videoProcessor } from '../utils/videoProcessing';

interface ExportModalProps {
  videoSrc: string;
  isOpen: boolean;
  onClose: () => void;
  onExportComplete: (blob: Blob, format: string) => void;
}

export type VideoFormat = 'mp4' | 'gif';
export type VideoResolution = '1080p' | '720p' | '480p';
export type VideoQuality = 'high' | 'medium' | 'low';

const ExportModal: React.FC<ExportModalProps> = ({
  videoSrc,
  isOpen,
  onClose,
  onExportComplete
}) => {
  const [format, setFormat] = useState<VideoFormat>('mp4');
  const [resolution, setResolution] = useState<VideoResolution>('720p');
  const [quality, setQuality] = useState<VideoQuality>('medium');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setProgress(0);
      setStatusMessage('Initializing export...');

      // Get video file from source
      const videoResponse = await fetch(videoSrc);
      const videoBlob = await videoResponse.blob();
      
      // Process the video
      const outputBlob = await videoProcessor.exportVideo(
        videoBlob,
        format,
        resolution,
        quality,
        (progress) => {
          setProgress(progress);
          setStatusMessage(`Processing video... ${progress}%`);
        }
      );
      
      setStatusMessage('Export completed!');
      setProgress(100);
      setIsExporting(false);
      
      onExportComplete(outputBlob, format);
    } catch (error) {
      console.error('Export failed:', error);
      setStatusMessage(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsExporting(false);
    }
  };

  return (
    <div className="export-modal-overlay">
      <div className="export-modal">
        <div className="export-modal-header">
          <h2>Export Video</h2>
          <button className="close-button" onClick={onClose} disabled={isExporting}>×</button>
        </div>
        
        <div className="export-modal-content">
          <p className="export-description">Choose your export settings. Higher quality will take longer to process.</p>
          
          <div className="export-options">
            <div className="option-group">
              <label>Format</label>
              <div className="format-options">
                <button 
                  className={`format-button ${format === 'mp4' ? 'active' : ''}`}
                  onClick={() => setFormat('mp4')}
                  disabled={isExporting}
                >
                  <div className="format-icon">🎬</div>
                  <div className="format-details">
                    <span className="format-name">MP4</span>
                    <span className="format-desc">High-quality video with audio, best for detailed tutorials</span>
                  </div>
                </button>
                
                <button 
                  className={`format-button ${format === 'gif' ? 'active' : ''}`}
                  onClick={() => setFormat('gif')}
                  disabled={isExporting}
                >
                  <div className="format-icon">🔄</div>
                  <div className="format-details">
                    <span className="format-name">GIF</span>
                    <span className="format-desc">Animated image, great for short clips and sharing</span>
                  </div>
                </button>
              </div>
            </div>
            
            <div className="option-group">
              <label>Resolution</label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value as VideoResolution)}
                disabled={isExporting}
              >
                <option value="1080p">1080p</option>
                <option value="720p">720p</option>
                <option value="480p">480p</option>
              </select>
              {resolution === '1080p' && <span className="option-desc">1920×1080px</span>}
              {resolution === '720p' && <span className="option-desc">1280×720px</span>}
              {resolution === '480p' && <span className="option-desc">854×480px</span>}
            </div>
            
            <div className="option-group">
              <label>Quality</label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as VideoQuality)}
                disabled={isExporting}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              {quality === 'high' && <span className="option-desc">Best quality, larger file size</span>}
              {quality === 'medium' && <span className="option-desc">Great for general tutorials and presentations</span>}
              {quality === 'low' && <span className="option-desc">Smallest file size, faster upload</span>}
            </div>
          </div>
          
          {isExporting && (
            <div className="export-progress">
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="status-message">{statusMessage}</p>
            </div>
          )}
        </div>
        
        <div className="export-modal-footer">
          <button className="cancel-button" onClick={onClose} disabled={isExporting}>
            Cancel
          </button>
          <button 
            className="export-button"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export Video'}
          </button>
        </div>
      </div>

      <style>
        {`
          .export-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }
          
          .export-modal {
            background-color: #1c1c1c;
            border-radius: 8px;
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
          }
          
          .export-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 24px;
            border-bottom: 1px solid #333;
          }
          
          .export-modal-header h2 {
            margin: 0;
            color: white;
            font-size: 20px;
          }
          
          .close-button {
            background: none;
            border: none;
            color: #aaa;
            font-size: 24px;
            cursor: pointer;
          }
          
          .close-button:hover {
            color: white;
          }
          
          .export-modal-content {
            padding: 24px;
          }
          
          .export-description {
            color: #aaa;
            margin-top: 0;
            margin-bottom: 24px;
          }
          
          .export-options {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          
          .option-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          
          .option-group label {
            color: white;
            font-weight: 500;
          }
          
          .option-desc {
            color: #aaa;
            font-size: 12px;
            margin-top: 4px;
          }
          
          .format-options {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          
          .format-button {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background-color: #333;
            border: 2px solid transparent;
            border-radius: 6px;
            cursor: pointer;
            text-align: left;
          }
          
          .format-button.active {
            border-color: #2563eb;
            background-color: rgba(37, 99, 235, 0.1);
          }
          
          .format-icon {
            font-size: 24px;
            line-height: 1;
          }
          
          .format-details {
            display: flex;
            flex-direction: column;
          }
          
          .format-name {
            font-weight: 600;
            color: white;
          }
          
          .format-desc {
            font-size: 12px;
            color: #aaa;
            margin-top: 2px;
          }
          
          .export-modal select {
            padding: 8px 12px;
            background-color: #333;
            color: white;
            border: 1px solid #444;
            border-radius: 4px;
            font-size: 14px;
          }
          
          .export-progress {
            margin-top: 24px;
          }
          
          .progress-bar-container {
            height: 10px;
            background-color: #333;
            border-radius: 5px;
            overflow: hidden;
            margin-bottom: 8px;
          }
          
          .progress-bar {
            height: 100%;
            background-color: #2563eb;
            transition: width 0.3s ease-out;
          }
          
          .status-message {
            color: #aaa;
            font-size: 14px;
            text-align: center;
            margin: 8px 0 0;
          }
          
          .export-modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            padding: 16px 24px;
            border-top: 1px solid #333;
          }
          
          .cancel-button {
            padding: 8px 16px;
            background: none;
            border: 1px solid #444;
            border-radius: 4px;
            color: white;
            cursor: pointer;
          }
          
          .export-button {
            padding: 8px 16px;
            background-color: #2563eb;
            border: none;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            cursor: pointer;
          }
          
          .export-button:hover {
            background-color: #1d4ed8;
          }
          
          .export-button:disabled, .cancel-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `}
      </style>
    </div>
  );
};

export default ExportModal; 