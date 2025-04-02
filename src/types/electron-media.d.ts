declare interface ElectronMediaTrackConstraints extends MediaTrackConstraints {
  mandatory?: {
    chromeMediaSource?: 'desktop' | 'screen';
    chromeMediaSourceId?: string;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    minFrameRate?: number;
    maxFrameRate?: number;
  };
}

declare interface ElectronDisplayMediaStreamOptions {
  video: ElectronMediaTrackConstraints;
  audio: boolean | MediaTrackConstraints;
} 