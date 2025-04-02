import Store from 'electron-store';

interface RecordingSettings {
  resolution: {
    width: number;
    height: number;
  };
  fps: number;
  audioDevice: string;
  videoDevice: string;
  cameraPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  cameraSize: number;
  backgroundBlur: boolean;
  theme: 'light' | 'dark';
}

interface ExportSettings {
  defaultFormat: 'mp4' | 'gif';
  defaultQuality: 'high' | 'medium' | 'low';
  defaultFPS: number;
  outputDirectory: string;
}

interface ShortcutSettings {
  zoomIn: string;
  zoomOut: string;
  toggleRecording: string;
  toggleCamera: string;
  togglePlayback: string;
  exitPreview: string;
}

interface AppSettings {
  recording: RecordingSettings;
  export: ExportSettings;
  shortcuts: ShortcutSettings;
}

const defaultSettings: AppSettings = {
  recording: {
    resolution: {
      width: 1920,
      height: 1080,
    },
    fps: 30,
    audioDevice: 'default',
    videoDevice: 'default',
    cameraPosition: 'top-right',
    cameraSize: 200,
    backgroundBlur: true,
    theme: 'dark',
  },
  export: {
    defaultFormat: 'mp4',
    defaultQuality: 'high',
    defaultFPS: 30,
    outputDirectory: '',
  },
  shortcuts: {
    zoomIn: 'Ctrl+Z',
    zoomOut: 'Ctrl+Shift+Z',
    toggleRecording: 'Ctrl+R',
    toggleCamera: 'Ctrl+C',
    togglePlayback: 'Space',
    exitPreview: 'Escape',
  },
};

class SettingsManager {
  private store: Store<AppSettings>;

  constructor() {
    this.store = new Store<AppSettings>({
      defaults: defaultSettings,
      schema: {
        recording: {
          type: 'object',
          properties: {
            resolution: {
              type: 'object',
              properties: {
                width: { type: 'number' },
                height: { type: 'number' },
              },
            },
            fps: { type: 'number' },
            audioDevice: { type: 'string' },
            videoDevice: { type: 'string' },
            cameraPosition: {
              type: 'string',
              enum: ['top-right', 'top-left', 'bottom-right', 'bottom-left'],
            },
            cameraSize: { type: 'number' },
            backgroundBlur: { type: 'boolean' },
            theme: { type: 'string', enum: ['light', 'dark'] },
          },
        },
        export: {
          type: 'object',
          properties: {
            defaultFormat: { type: 'string', enum: ['mp4', 'gif'] },
            defaultQuality: { type: 'string', enum: ['high', 'medium', 'low'] },
            defaultFPS: { type: 'number' },
            outputDirectory: { type: 'string' },
          },
        },
        shortcuts: {
          type: 'object',
          properties: {
            zoomIn: { type: 'string' },
            zoomOut: { type: 'string' },
            toggleRecording: { type: 'string' },
            toggleCamera: { type: 'string' },
            togglePlayback: { type: 'string' },
            exitPreview: { type: 'string' },
          },
        },
      },
    });
  }

  getSettings(): AppSettings {
    return this.store.store;
  }

  getRecordingSettings(): RecordingSettings {
    return this.store.get('recording');
  }

  getExportSettings(): ExportSettings {
    return this.store.get('export');
  }

  getShortcutSettings(): ShortcutSettings {
    return this.store.get('shortcuts');
  }

  updateRecordingSettings(settings: Partial<RecordingSettings>): void {
    this.store.set('recording', {
      ...this.getRecordingSettings(),
      ...settings,
    });
  }

  updateExportSettings(settings: Partial<ExportSettings>): void {
    this.store.set('export', {
      ...this.getExportSettings(),
      ...settings,
    });
  }

  updateShortcutSettings(settings: Partial<ShortcutSettings>): void {
    this.store.set('shortcuts', {
      ...this.getShortcutSettings(),
      ...settings,
    });
  }

  resetToDefaults(): void {
    this.store.clear();
    this.store.set(defaultSettings);
  }

  // Helper methods for specific settings
  getResolution(): { width: number; height: number } {
    return this.store.get('recording.resolution');
  }

  getFPS(): number {
    return this.store.get('recording.fps');
  }

  getTheme(): 'light' | 'dark' {
    return this.store.get('recording.theme');
  }

  getCameraPosition(): RecordingSettings['cameraPosition'] {
    return this.store.get('recording.cameraPosition');
  }

  getCameraSize(): number {
    return this.store.get('recording.cameraSize');
  }

  isBackgroundBlurEnabled(): boolean {
    return this.store.get('recording.backgroundBlur');
  }

  getDefaultExportFormat(): 'mp4' | 'gif' {
    return this.store.get('export.defaultFormat');
  }

  getDefaultExportQuality(): 'high' | 'medium' | 'low' {
    return this.store.get('export.defaultQuality');
  }

  getOutputDirectory(): string {
    return this.store.get('export.outputDirectory');
  }
}

export const settingsManager = new SettingsManager(); 