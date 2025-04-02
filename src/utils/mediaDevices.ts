interface MediaDevice {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput' | 'videoinput';
  groupId?: string;
}

interface MediaStreamOptions {
  video?: {
    deviceId?: string;
    width?: number;
    height?: number;
    frameRate?: number;
    aspectRatio?: number;
  };
  audio?: {
    deviceId?: string;
    echoCancellation?: boolean;
    noiseSuppression?: boolean;
    autoGainControl?: boolean;
  };
}

interface DisplayMediaOptions {
  video: {
    cursor?: 'always' | 'motion' | 'never';
    displaySurface?: 'monitor' | 'window' | 'application';
  };
  audio?: {
    echoCancellation?: boolean;
    noiseSuppression?: boolean;
    autoGainControl?: boolean;
  };
}

class MediaDeviceManager {
  private static instance: MediaDeviceManager;
  private devices: MediaDevice[] = [];
  private streams: Map<string, MediaStream> = new Map();
  private permissionsGranted: boolean = false;

  private constructor() {
    this.initializeDevices();
  }

  static getInstance(): MediaDeviceManager {
    if (!MediaDeviceManager.instance) {
      MediaDeviceManager.instance = new MediaDeviceManager();
    }
    return MediaDeviceManager.instance;
  }

  // Device initialization
  private async initializeDevices(): Promise<void> {
    try {
      await this.requestPermissions();
      await this.updateDevices();
      this.setupDeviceChangeListener();
    } catch (error) {
      console.error('Error initializing media devices:', error);
      throw error;
    }
  }

  private async requestPermissions(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      stream.getTracks().forEach(track => track.stop());
      this.permissionsGranted = true;
    } catch (error) {
      console.error('Error requesting media permissions:', error);
      throw error;
    }
  }

  private async updateDevices(): Promise<void> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.devices = devices.map(device => ({
        deviceId: device.deviceId,
        label: device.label || `Unknown ${device.kind}`,
        kind: device.kind as MediaDevice['kind'],
        groupId: device.groupId,
      }));
    } catch (error) {
      console.error('Error updating media devices:', error);
      throw error;
    }
  }

  private setupDeviceChangeListener(): void {
    navigator.mediaDevices.addEventListener('devicechange', async () => {
      await this.updateDevices();
      this.notifyDeviceChange();
    });
  }

  // Device access methods
  async getDevices(): Promise<MediaDevice[]> {
    if (!this.permissionsGranted) {
      await this.requestPermissions();
    }
    return [...this.devices];
  }

  async getAudioInputDevices(): Promise<MediaDevice[]> {
    return this.devices.filter(device => device.kind === 'audioinput');
  }

  async getAudioOutputDevices(): Promise<MediaDevice[]> {
    return this.devices.filter(device => device.kind === 'audiooutput');
  }

  async getVideoInputDevices(): Promise<MediaDevice[]> {
    return this.devices.filter(device => device.kind === 'videoinput');
  }

  // Stream management methods
  async getScreenCaptureStream(options?: MediaStreamOptions): Promise<MediaStream> {
    try {
      const sources = await (window as any).electron.getDisplayMedia();
      const stream = await (window as any).electron.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sources[0].id,
            minWidth: options?.video?.width || 1920,
            maxWidth: options?.video?.width || 1920,
            minHeight: options?.video?.height || 1080,
            maxHeight: options?.video?.height || 1080,
            minFrameRate: options?.video?.frameRate || 30,
            maxFrameRate: options?.video?.frameRate || 30,
          }
        }
      } as MediaStreamConstraints);
      
      this.streams.set('screen', stream);
      return stream;
    } catch (error) {
      console.error('Error getting screen capture stream:', error);
      throw error;
    }
  }

  async getCameraStream(options?: MediaStreamOptions): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: options?.video?.deviceId,
          width: options?.video?.width,
          height: options?.video?.height,
          frameRate: options?.video?.frameRate,
          aspectRatio: options?.video?.aspectRatio,
        },
      });
      this.streams.set('camera', stream);
      return stream;
    } catch (error) {
      console.error('Error getting camera stream:', error);
      throw error;
    }
  }

  async getAudioStream(options?: MediaStreamOptions): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: options?.audio?.deviceId,
          echoCancellation: options?.audio?.echoCancellation ?? true,
          noiseSuppression: options?.audio?.noiseSuppression ?? true,
          autoGainControl: options?.audio?.autoGainControl ?? true,
        },
      });
      this.streams.set('audio', stream);
      return stream;
    } catch (error) {
      console.error('Error getting audio stream:', error);
      throw error;
    }
  }

  // Stream cleanup methods
  stopStream(type: 'screen' | 'camera' | 'audio'): void {
    const stream = this.streams.get(type);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      this.streams.delete(type);
    }
  }

  stopAllStreams(): void {
    this.streams.forEach(stream => {
      stream.getTracks().forEach(track => track.stop());
    });
    this.streams.clear();
  }

  // Device change notification
  private deviceChangeListeners: ((devices: MediaDevice[]) => void)[] = [];

  addDeviceChangeListener(listener: (devices: MediaDevice[]) => void): () => void {
    this.deviceChangeListeners.push(listener);
    return () => {
      this.deviceChangeListeners = this.deviceChangeListeners.filter(l => l !== listener);
    };
  }

  private notifyDeviceChange(): void {
    this.deviceChangeListeners.forEach(listener => listener(this.devices));
  }

  // Device validation methods
  validateDevice(deviceId: string): boolean {
    return this.devices.some(device => device.deviceId === deviceId);
  }

  validateStreamOptions(options: MediaStreamOptions): boolean {
    if (options.video?.deviceId && !this.validateDevice(options.video.deviceId)) {
      return false;
    }
    if (options.audio?.deviceId && !this.validateDevice(options.audio.deviceId)) {
      return false;
    }
    return true;
  }

  // Device capabilities methods
  async getDeviceCapabilities(deviceId: string): Promise<MediaTrackCapabilities> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId },
      });
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      stream.getTracks().forEach(track => track.stop());
      return capabilities;
    } catch (error) {
      console.error('Error getting device capabilities:', error);
      throw error;
    }
  }

  // Device constraints methods
  async getDeviceConstraints(deviceId: string): Promise<MediaTrackConstraints> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId },
      });
      const track = stream.getVideoTracks()[0];
      const constraints = track.getConstraints();
      stream.getTracks().forEach(track => track.stop());
      return constraints;
    } catch (error) {
      console.error('Error getting device constraints:', error);
      throw error;
    }
  }
}

export const mediaDeviceManager = MediaDeviceManager.getInstance(); 