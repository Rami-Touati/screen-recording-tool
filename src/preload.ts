import { contextBridge, ipcRenderer, desktopCapturer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    startRecording: (options: any) => ipcRenderer.invoke('start-recording', options),
    stopRecording: () => ipcRenderer.invoke('stop-recording'),
    exportToMP4: (filePath: string) => ipcRenderer.invoke('export-to-mp4', filePath),
    exportToGIF: (filePath: string) => ipcRenderer.invoke('export-to-gif', filePath),
    getDisplayMedia: async () => {
      const sources = await desktopCapturer.getSources({
        types: ['screen', 'window'],
        thumbnailSize: { width: 1280, height: 720 }
      });
      return sources;
    },
    getUserMedia: async (constraints: MediaStreamConstraints) => {
      return navigator.mediaDevices.getUserMedia(constraints);
    }
  }
); 