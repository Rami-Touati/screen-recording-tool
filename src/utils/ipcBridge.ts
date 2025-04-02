interface IpcBridge {
  send: (channel: string, ...args: any[]) => void;
  on: (channel: string, func: (...args: any[]) => void) => void;
  once: (channel: string, func: (...args: any[]) => void) => void;
  removeListener: (channel: string, func: (...args: any[]) => void) => void;
  removeAllListeners: (channel: string) => void;
}

class IpcBridgeManager {
  private static instance: IpcBridgeManager;
  private bridge: IpcBridge;

  private constructor() {
    // Initialize the bridge based on the environment
    if (window.electron) {
      this.bridge = window.electron;
    } else {
      // Fallback for web environment
      this.bridge = {
        send: (channel: string, ...args: any[]) => {
          console.log(`[IPC] Sending to ${channel}:`, args);
        },
        on: (channel: string, func: (...args: any[]) => void) => {
          console.log(`[IPC] Listening to ${channel}`);
        },
        once: (channel: string, func: (...args: any[]) => void) => {
          console.log(`[IPC] Listening once to ${channel}`);
        },
        removeListener: (channel: string, func: (...args: any[]) => void) => {
          console.log(`[IPC] Removing listener from ${channel}`);
        },
        removeAllListeners: (channel: string) => {
          console.log(`[IPC] Removing all listeners from ${channel}`);
        },
      };
    }
  }

  static getInstance(): IpcBridgeManager {
    if (!IpcBridgeManager.instance) {
      IpcBridgeManager.instance = new IpcBridgeManager();
    }
    return IpcBridgeManager.instance;
  }

  // Recording-related IPC methods
  startRecording(options: {
    videoSource: string;
    audioSource: string;
    cameraEnabled: boolean;
    resolution: { width: number; height: number };
    fps: number;
  }): void {
    this.bridge.send('start-recording', options);
  }

  stopRecording(): void {
    this.bridge.send('stop-recording');
  }

  onRecordingStarted(callback: () => void): void {
    this.bridge.on('recording-started', callback);
  }

  onRecordingStopped(callback: (blob: Blob) => void): void {
    this.bridge.on('recording-stopped', callback);
  }

  onRecordingError(callback: (error: Error) => void): void {
    this.bridge.on('recording-error', callback);
  }

  // Export-related IPC methods
  exportToMP4(blob: Blob, outputPath: string): void {
    this.bridge.send('export-mp4', blob, outputPath);
  }

  exportToGIF(blob: Blob, outputPath: string, options: {
    fps: number;
    loop: boolean;
  }): void {
    this.bridge.send('export-gif', blob, outputPath, options);
  }

  onExportProgress(callback: (progress: number) => void): void {
    this.bridge.on('export-progress', callback);
  }

  onExportComplete(callback: (outputPath: string) => void): void {
    this.bridge.on('export-complete', callback);
  }

  onExportError(callback: (error: Error) => void): void {
    this.bridge.on('export-error', callback);
  }

  // Settings-related IPC methods
  saveSettings(settings: any): void {
    this.bridge.send('save-settings', settings);
  }

  loadSettings(): void {
    this.bridge.send('load-settings');
  }

  onSettingsLoaded(callback: (settings: any) => void): void {
    this.bridge.on('settings-loaded', callback);
  }

  // Device-related IPC methods
  getMediaDevices(): void {
    this.bridge.send('get-media-devices');
  }

  onMediaDevices(callback: (devices: any[]) => void): void {
    this.bridge.on('media-devices', callback);
  }

  // UI-related IPC methods
  showSaveDialog(options: {
    title?: string;
    defaultPath?: string;
    filters?: { name: string; extensions: string[] }[];
  }): void {
    this.bridge.send('show-save-dialog', options);
  }

  onSaveDialogResult(callback: (filePath: string | undefined) => void): void {
    this.bridge.on('save-dialog-result', callback);
  }

  // Cleanup method
  cleanup(): void {
    this.bridge.removeAllListeners('recording-started');
    this.bridge.removeAllListeners('recording-stopped');
    this.bridge.removeAllListeners('recording-error');
    this.bridge.removeAllListeners('export-progress');
    this.bridge.removeAllListeners('export-complete');
    this.bridge.removeAllListeners('export-error');
    this.bridge.removeAllListeners('settings-loaded');
    this.bridge.removeAllListeners('media-devices');
    this.bridge.removeAllListeners('save-dialog-result');
  }
}

export const ipcBridge = IpcBridgeManager.getInstance(); 