import { desktopCapturer } from 'electron';
import * as ffmpeg from 'ffmpeg-static';
import * as Whammy from 'whammy';

interface RecordingOptions {
  videoSource: 'screen' | 'camera';
  audioSource: 'default' | 'none';
  cameraEnabled: boolean;
  resolution: {
    width: number;
    height: number;
  };
  fps: number;
}

class RecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private streams: Map<string, MediaStream> = new Map();
  private chunks: Blob[] = [];

  async startRecording(options: RecordingOptions): Promise<void> {
    try {
      const videoStream = await this.getVideoStream(options);
      const audioStream = options.audioSource === 'default' ? await this.getAudioStream() : null;

      const tracks = [
        ...videoStream.getVideoTracks(),
        ...(audioStream ? audioStream.getAudioTracks() : []),
      ];

      const combinedStream = new MediaStream(tracks);

      this.mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp9',
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  private async getVideoStream(options: RecordingOptions): Promise<MediaStream> {
    if (options.videoSource === 'screen') {
      return this.getScreenStream(options);
    } else {
      return this.getCameraStream(options);
    }
  }

  private async getScreenStream(options: RecordingOptions): Promise<MediaStream> {
    try {
      const sources = await (window as any).electron.getDisplayMedia();
      const stream = await (window as any).electron.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sources[0].id,
            minWidth: options.resolution.width,
            maxWidth: options.resolution.width,
            minHeight: options.resolution.height,
            maxHeight: options.resolution.height,
            minFrameRate: options.fps,
            maxFrameRate: options.fps,
          }
        }
      } as MediaStreamConstraints);
      
      this.streams.set('screen', stream);
      return stream;
    } catch (error) {
      console.error('Error getting screen stream:', error);
      throw error;
    }
  }

  private async getCameraStream(options: RecordingOptions): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: options.resolution.width },
          height: { ideal: options.resolution.height },
          frameRate: { ideal: options.fps },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.streams.set('camera', stream);
      return stream;
    } catch (error) {
      console.error('Error getting camera stream:', error);
      throw error;
    }
  }

  private async getAudioStream(): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.streams.set('audio', stream);
      return stream;
    } catch (error) {
      console.error('Error getting audio stream:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        this.chunks = [];
        
        this.streams.forEach(stream => {
          stream.getTracks().forEach(track => track.stop());
        });
        this.streams.clear();
        
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  async exportToMP4(blob: Blob, outputPath: string): Promise<void> {
    // Implementation for MP4 export using FFmpeg
    // This will be implemented in the next step
  }

  async exportToGIF(blob: Blob, outputPath: string, options: {
    fps: number;
    loop: boolean;
  }): Promise<void> {
    // Implementation for GIF export using Whammy.js
    // This will be implemented in the next step
  }
}

export const recordingService = new RecordingService(); 