import { DesktopCapturerSource } from 'electron';

declare global {
  interface Window {
    electron: {
      startRecording: (options: RecordingOptions) => Promise<DesktopCapturerSource[]>;
      stopRecording: () => void;
      desktopCapturer: {
        getSources: (options: { types: Array<'window' | 'screen'> }) => Promise<DesktopCapturerSource[]>;
      };
      onRecordingError: (callback: (error: string) => void) => void;
      onRecordingStatus: (callback: (status: string) => void) => void;
      // IPC methods
      send: (channel: string, ...args: any[]) => void;
      on: (channel: string, func: (...args: any[]) => void) => void;
      once: (channel: string, func: (...args: any[]) => void) => void;
      removeListener: (channel: string, func: (...args: any[]) => void) => void;
      removeAllListeners: (channel: string) => void;
      // File system methods
      showSaveDialog: (options: {
        title?: string;
        defaultPath?: string;
        filters?: { name: string; extensions: string[] }[];
      }) => Promise<string | undefined>;
      saveFile: (filePath: string, buffer: ArrayBuffer) => Promise<void>;
      loadFile: (filePath: string) => Promise<ArrayBuffer>;
      deleteFile: (filePath: string) => Promise<void>;
      createDirectory: (path: string) => Promise<void>;
      listDirectory: (path: string) => Promise<FileInfo[]>;
      deleteDirectory: (path: string) => Promise<void>;
      getFileInfo: (filePath: string) => Promise<FileInfo>;
      getDirectorySize: (path: string) => Promise<number>;
      watchDirectory: (path: string, callback: (event: string, filePath: string) => void) => Promise<void>;
      unwatchDirectory: (path: string) => Promise<void>;
      exportToMP4: (filePath: string) => Promise<void>;
      exportToGIF: (filePath: string) => Promise<void>;
      getDisplayMedia: () => Promise<{ sourceId: string }>;
      // Screen capture methods
      getScreenStream: (sourceId: string) => Promise<MediaStream>;
    }
  }
}

export interface RecordingOptions {
  videoSource?: string;
  audioSource?: string;
  cameraEnabled?: boolean;
  resolution?: { width: number; height: number };
  fps?: number;
  mode?: 'fullscreen' | 'custom' | 'window';
  includeAudio?: boolean;
}

export interface FileInfo {
  name: string;
  path: string;
  size: number;
  type: string;
  lastModified: Date;
  isDirectory: boolean;
}

export {}; 