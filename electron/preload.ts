import { contextBridge, ipcRenderer, desktopCapturer } from 'electron';

// Wait for the DOM to be ready
window.addEventListener('DOMContentLoaded', () => {
  // Prevent default drag and drop behavior
  document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
  }, false);

  document.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
  }, false);

  document.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
  }, false);

  document.addEventListener('dragenter', (e) => {
    e.preventDefault();
    e.stopPropagation();
  }, false);
});

declare global {
  interface Window {
    electron: {
      startRecording: (options: any) => Promise<void>;
      stopRecording: () => Promise<void>;
      exportToMP4: (filePath: string) => Promise<void>;
      exportToGIF: (filePath: string) => Promise<void>;
      versions: {
        node: () => string;
        chrome: () => string;
        electron: () => string;
      };
      platform: string;
    };
  }
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    startRecording: (options: any) => ipcRenderer.send('start-recording', options),
    stopRecording: () => ipcRenderer.send('stop-recording'),
    exportToMP4: (filePath: string) => ipcRenderer.invoke('export-to-mp4', filePath),
    exportToGIF: (filePath: string) => ipcRenderer.invoke('export-to-gif', filePath),
    onRecordingError: (callback: (error: string) => void) => 
      ipcRenderer.on('recording-error', (_event, error) => callback(error)),
    onRecordingStatus: (callback: (status: string) => void) =>
      ipcRenderer.on('recording-status', (_event, status) => callback(status)),
    // Add version info
    versions: {
      node: () => process.versions.node,
      chrome: () => process.versions.chrome,
      electron: () => process.versions.electron,
    },
    // Add basic utilities
    platform: process.platform
  }
); 