interface ElectronAPI {
  send: (channel: string, ...args: any[]) => void;
  on: (channel: string, func: (...args: any[]) => void) => void;
  once: (channel: string, func: (...args: any[]) => void) => void;
  removeListener: (channel: string, func: (...args: any[]) => void) => void;
  removeAllListeners: (channel: string) => void;
  showSaveDialog: (options: {
    title?: string;
    defaultPath?: string;
    filters?: { name: string; extensions: string[] }[];
  }) => Promise<string | undefined>;
  startRecording: (options: {
    videoSource: string;
    audioSource: string;
    cameraEnabled: boolean;
    resolution: { width: number; height: number };
    fps: number;
  }) => void;
  stopRecording: () => void;
  exportToMP4: (blob: Blob, outputPath: string) => void;
  exportToGIF: (blob: Blob, outputPath: string, options: {
    fps: number;
    loop: boolean;
  }) => void;
  // File system methods
  saveFile: (filePath: string, buffer: ArrayBuffer) => Promise<void>;
  loadFile: (filePath: string) => Promise<ArrayBuffer>;
  deleteFile: (filePath: string) => Promise<void>;
  createDirectory: (path: string) => Promise<void>;
  listDirectory: (path: string) => Promise<{
    name: string;
    path: string;
    size: number;
    type: string;
    lastModified: Date;
    isDirectory: boolean;
  }[]>;
  deleteDirectory: (path: string) => Promise<void>;
  getFileInfo: (filePath: string) => Promise<{
    name: string;
    path: string;
    size: number;
    type: string;
    lastModified: Date;
    isDirectory: boolean;
  }>;
  getDirectorySize: (path: string) => Promise<number>;
  watchDirectory: (path: string, callback: (event: string, filePath: string) => void) => Promise<void>;
  unwatchDirectory: (path: string) => Promise<void>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {}; 