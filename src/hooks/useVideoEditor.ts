import { useState, useCallback } from 'react';
import { videoProcessor } from '../utils/videoProcessing';
import { Background } from '../components/BackgroundPanel';

interface VideoEditorState {
  videoSrc: string;
  duration: number;
  trimRange: [number, number];
  background: Background;
  smartFeatures: {[key: string]: boolean};
  isProcessing: boolean;
}

interface UseVideoEditorProps {
  initialVideoSrc: string;
  initialDuration: number;
}

export const useVideoEditor = ({ initialVideoSrc, initialDuration }: UseVideoEditorProps) => {
  const [state, setState] = useState<VideoEditorState>({
    videoSrc: initialVideoSrc,
    duration: initialDuration,
    trimRange: [0, initialDuration],
    background: {
      type: 'color',
      value: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
      blur: 0,
      dim: 0
    },
    smartFeatures: {},
    isProcessing: false
  });

  const setTrimRange = useCallback((start: number, end: number) => {
    setState(prev => ({
      ...prev,
      trimRange: [start, end]
    }));
  }, []);

  const setBackground = useCallback((background: Background) => {
    setState(prev => ({
      ...prev,
      background
    }));
  }, []);

  const toggleSmartFeature = useCallback((feature: string, enabled: boolean) => {
    setState(prev => ({
      ...prev,
      smartFeatures: {
        ...prev.smartFeatures,
        [feature]: enabled
      }
    }));
  }, []);

  const processVideo = useCallback(async (
    format: 'mp4' | 'gif',
    resolution: '1080p' | '720p' | '480p',
    quality: 'high' | 'medium' | 'low',
    onProgress?: (progress: number) => void
  ) => {
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      // Get the video blob from the source
      const videoResponse = await fetch(state.videoSrc);
      const videoBlob = await videoResponse.blob();

      // Apply trim if needed
      let processedBlob = videoBlob;
      if (state.trimRange[0] > 0 || state.trimRange[1] < state.duration) {
        processedBlob = await videoProcessor.trimVideo(
          videoBlob,
          state.trimRange[0],
          state.trimRange[1],
          onProgress
        );
      }

      // Apply background if needed
      if (state.background.blur > 0 || state.background.dim > 0) {
        processedBlob = await videoProcessor.applyBackground(
          processedBlob,
          state.background.value,
          state.background.blur,
          state.background.dim,
          onProgress
        );
      }

      // Export to final format
      const finalBlob = await videoProcessor.exportVideo(
        processedBlob,
        format,
        resolution,
        quality,
        onProgress
      );

      setState(prev => ({ ...prev, isProcessing: false }));
      return finalBlob;
    } catch (error) {
      setState(prev => ({ ...prev, isProcessing: false }));
      throw error;
    }
  }, [state.videoSrc, state.duration, state.trimRange, state.background]);

  return {
    videoSrc: state.videoSrc,
    duration: state.duration,
    trimRange: state.trimRange,
    background: state.background,
    smartFeatures: state.smartFeatures,
    isProcessing: state.isProcessing,
    setTrimRange,
    setBackground,
    toggleSmartFeature,
    processVideo
  };
};

export type VideoEditorHook = ReturnType<typeof useVideoEditor>; 