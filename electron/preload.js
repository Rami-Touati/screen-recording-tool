const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    startRecording: (options) => ipcRenderer.send('start-recording', options),
    stopRecording: () => ipcRenderer.send('stop-recording'),
    exportToMP4: (filePath) => ipcRenderer.invoke('export-to-mp4', filePath),
    exportToGIF: (filePath) => ipcRenderer.invoke('export-to-gif', filePath),
  }
); 