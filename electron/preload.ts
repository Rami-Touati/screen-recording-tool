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

// Define interfaces for recording options
interface RecordingOptions {
  videoSource?: string;
  audioSource?: string;
  cameraEnabled?: boolean;
  resolution?: { width: number; height: number };
  fps?: number;
  mode?: 'fullscreen' | 'custom' | 'window';
  includeAudio?: boolean;
}

const api = {
  startRecording: async (options: RecordingOptions) => {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['window', 'screen'],
        thumbnailSize: { width: 0, height: 0 }
      });
      return sources;
    } catch (error) {
      console.error('Error getting sources:', error);
      throw error;
    }
  },
  
  stopRecording: () => ipcRenderer.send('stop-recording'),
  
  getDisplayMedia: async () => {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen', 'window'],
        thumbnailSize: { width: 1280, height: 720 }
      });
      return sources;
    } catch (error) {
      console.error('Error getting display media:', error);
      throw error;
    }
  },

  getUserMedia: async (constraints: MediaStreamConstraints) => {
    return navigator.mediaDevices.getUserMedia(constraints);
  },
  
  onRecordingError: (callback: (error: string) => void) => 
    ipcRenderer.on('recording-error', (_event, error) => callback(error)),
  
  onRecordingStatus: (callback: (status: string) => void) =>
    ipcRenderer.on('recording-status', (_event, status) => callback(status)),

  // Add IPC methods
  send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
  on: (channel: string, func: (...args: any[]) => void) => ipcRenderer.on(channel, func),
  once: (channel: string, func: (...args: any[]) => void) => ipcRenderer.once(channel, func),
  removeListener: (channel: string, func: (...args: any[]) => void) => ipcRenderer.removeListener(channel, func),
  removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel),

  // Add file system methods
  showSaveDialog: (options: any) => ipcRenderer.invoke('show-save-dialog', options),
  saveFile: (filePath: string, buffer: ArrayBuffer) => ipcRenderer.invoke('save-file', filePath, buffer),
  loadFile: (filePath: string) => ipcRenderer.invoke('load-file', filePath),
  deleteFile: (filePath: string) => ipcRenderer.invoke('delete-file', filePath),
  createDirectory: (path: string) => ipcRenderer.invoke('create-directory', path),
  listDirectory: (path: string) => ipcRenderer.invoke('list-directory', path),
  deleteDirectory: (path: string) => ipcRenderer.invoke('delete-directory', path),
  getFileInfo: (filePath: string) => ipcRenderer.invoke('get-file-info', filePath),
  getDirectorySize: (path: string) => ipcRenderer.invoke('get-directory-size', path),
  watchDirectory: (path: string, callback: (event: string, filePath: string) => void) => 
    ipcRenderer.invoke('watch-directory', path, callback),
  unwatchDirectory: (path: string) => ipcRenderer.invoke('unwatch-directory', path),
  exportToMP4: (filePath: string) => ipcRenderer.invoke('export-to-mp4', filePath),
  exportToGIF: (filePath: string) => ipcRenderer.invoke('export-to-gif', filePath),
  
  // Add screen capture methods
  getScreenStream: async (sourceId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          // @ts-ignore - these constraints are valid but TypeScript doesn't know about them
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sourceId,
            minWidth: 1280,
            maxWidth: 1920,
            minHeight: 720,
            maxHeight: 1080
          }
        }
      });
      return stream;
    } catch (error) {
      console.error('Error getting screen stream:', error);
      throw error;
    }
  }
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electron', api);

// Type declaration for the window object
declare global {
  interface Window {
    electron: typeof api;
  }
} 