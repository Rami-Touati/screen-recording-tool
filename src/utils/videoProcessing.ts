import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

interface VideoProcessingOptions {
  fps: number;
  bitrate: string;
  resolution: {
    width: number;
    height: number;
  };
  zoomRegions: Array<{
    startTime: number;
    endTime: number;
    scale: number;
  }>;
  cropSettings?: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  textOverlays: Array<{
    text: string;
    position: { x: number; y: number };
    startTime: number;
    endTime: number;
  }>;
}

class VideoProcessor {
  private static instance: VideoProcessor;
  private ffmpegInstance: FFmpeg | null = null;

  private constructor() {}

  static getInstance(): VideoProcessor {
    if (!VideoProcessor.instance) {
      VideoProcessor.instance = new VideoProcessor();
    }
    return VideoProcessor.instance;
  }

  private async init(): Promise<FFmpeg> {
    if (this.ffmpegInstance) return this.ffmpegInstance;

    const ffmpeg = new FFmpeg();
    await ffmpeg.load({
      coreURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd/ffmpeg-core.js', 'text/javascript'),
      wasmURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd/ffmpeg-core.wasm', 'application/wasm'),
      workerURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd/ffmpeg-core.worker.js', 'text/javascript')
    });

    this.ffmpegInstance = ffmpeg;
    return ffmpeg;
  }

  async processVideo(
    videoBlob: Blob,
    options: VideoProcessingOptions,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    const ff = await this.init();
    
    try {
      // Write input file
      await ff.writeFile('input.webm', await fetchFile(videoBlob));
      
      let currentFilter = '';
      let inputLabel = '[0:v]';
      let outputLabel = '[v0]';
      
      // Apply crop if specified
      if (options.cropSettings) {
        currentFilter += `${inputLabel}crop=${options.cropSettings.width}:${options.cropSettings.height}:${options.cropSettings.x}:${options.cropSettings.y}${outputLabel};`;
        inputLabel = outputLabel;
        outputLabel = '[v1]';
      }
      
      // Apply zoom regions if any
      if (options.zoomRegions.length > 0) {
        const sortedRegions = [...options.zoomRegions].sort((a, b) => a.startTime - b.startTime);
        
        sortedRegions.forEach((region, index) => {
          const zoomFactor = 1 / region.scale;
          const offset = (1 - zoomFactor) / 2;
          
          currentFilter += `${inputLabel}crop=iw*${zoomFactor}:ih*${zoomFactor}:iw*${offset}:ih*${offset},scale=${options.resolution.width}:${options.resolution.height}[v${index + 2}];`;
          inputLabel = `[v${index + 2}]`;
          outputLabel = `[v${index + 3}]`;
        });
      }
      
      // Add text overlays if any
      options.textOverlays.forEach((overlay, index) => {
        currentFilter += `${inputLabel}drawtext=text='${overlay.text}':x=${overlay.position.x}:y=${overlay.position.y}:enable='between(t,${overlay.startTime},${overlay.endTime})':fontsize=24:fontcolor=white${outputLabel};`;
        inputLabel = outputLabel;
        outputLabel = `[v${index + 4}]`;
      });
      
      // Remove last semicolon
      currentFilter = currentFilter.slice(0, -1);
      
      // Prepare FFmpeg command with high quality settings
      const command = [
        '-i', 'input.webm',
        '-filter_complex', currentFilter,
        '-c:v', 'libx264',
        '-preset', 'slow', // Better compression
        '-crf', '18', // High quality (lower is better)
        '-b:v', options.bitrate,
        '-maxrate', options.bitrate,
        '-bufsize', `${parseInt(options.bitrate) * 2}M`,
        '-r', options.fps.toString(),
        '-vf', `scale=${options.resolution.width}:${options.resolution.height}`,
        '-c:a', 'aac',
        '-b:a', '320k',
        '-ar', '48000',
        '-movflags', '+faststart',
        'output.mp4'
      ];
      
      // Execute FFmpeg command
      await ff.exec(command);
      
      // Read and return the processed video
      const data = await ff.readFile('output.mp4');
      return new Blob([data], { type: 'video/mp4' });
      
    } catch (error) {
      console.error('Error processing video:', error);
      throw error;
    }
  }

  async trimVideo(
    videoBlob: Blob,
    startTime: number,
    endTime: number,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    const ff = await this.init();
    
    await ff.writeFile('input.webm', await fetchFile(videoBlob));
    const duration = endTime - startTime;
    
    await ff.exec([
      '-ss', startTime.toString(),
      '-i', 'input.webm',
      '-t', duration.toString(),
      '-c', 'copy',
      'output.webm'
    ]);
    
    const data = await ff.readFile('output.webm');
    return new Blob([data], { type: 'video/webm' });
  }

  async applyBackground(
    videoBlob: Blob,
    background: string,
    blur: number,
    dim: number,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    const ff = await this.init();
    
    await ff.writeFile('input.webm', await fetchFile(videoBlob));
    
    if (background.startsWith('data:') || background.startsWith('http')) {
      const bgResponse = await fetch(background);
      const bgBlob = await bgResponse.blob();
      await ff.writeFile('bg.jpg', await fetchFile(bgBlob));
    }
    
    const filter = background.startsWith('data:') || background.startsWith('http')
      ? `[1:v]scale=1920:1080,boxblur=${blur}[bg];[bg]brightness=${1 - dim/100}[bbg];[bbg][0:v]overlay=(W-w)/2:(H-h)/2`
      : '[0:v]overlay=(W-w)/2:(H-h)/2';
    
    await ff.exec([
      '-i', 'input.webm',
      ...(background.startsWith('data:') || background.startsWith('http') ? ['-i', 'bg.jpg'] : []),
      '-filter_complex', filter,
      '-c:a', 'copy',
      'output.webm'
    ]);
    
    const data = await ff.readFile('output.webm');
    return new Blob([data], { type: 'video/webm' });
  }

  async exportVideo(
    videoBlob: Blob,
    format: 'mp4' | 'gif',
    resolution: '1080p' | '720p' | '480p',
    quality: 'high' | 'medium' | 'low',
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    const ff = await this.init();
    
    await ff.writeFile('input.webm', await fetchFile(videoBlob));
    
    const crf = quality === 'high' ? '18' : quality === 'medium' ? '23' : '28';
    const scale = resolution === '1080p' ? '1920:1080' : resolution === '720p' ? '1280:720' : '854:480';
    
    if (format === 'mp4') {
      await ff.exec([
        '-i', 'input.webm',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', crf,
        '-vf', `scale=${scale}`,
        '-c:a', 'aac',
        '-b:a', '192k',
        '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart',
        'output.mp4'
      ]);
      
      const data = await ff.readFile('output.mp4');
      return new Blob([data], { type: 'video/mp4' });
    } else {
      const fps = quality === 'high' ? '20' : quality === 'medium' ? '15' : '10';
      const gifScale = resolution === '1080p' ? '480:-1' : resolution === '720p' ? '360:-1' : '240:-1';
      
      await ff.exec([
        '-i', 'input.webm',
        '-vf', `scale=${gifScale},fps=${fps},split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
        '-loop', '0',
        'output.gif'
      ]);
      
      const data = await ff.readFile('output.gif');
      return new Blob([data], { type: 'image/gif' });
    }
  }

  async applyZoomEffects(
    videoBlob: Blob,
    zoomRegions: Array<{
      startTime: number;
      endTime: number;
      scale: number;
    }>,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    const ff = await this.init();
    
    try {
      // Write input file
      await ff.writeFile('input.webm', await fetchFile(videoBlob));
      
      if (zoomRegions.length === 0) {
        // If no zoom regions, return original video
        const data = await ff.readFile('input.webm');
        return new Blob([data], { type: 'video/webm' });
      }

      // Sort zoom regions by start time
      const sortedRegions = [...zoomRegions].sort((a, b) => a.startTime - b.startTime);

      // Create filter complex command for zoom effects
      let filterComplex = '';
      let currentInput = '[0:v]';
      let currentOutput = '';
      
      sortedRegions.forEach((region, index) => {
        const startTime = region.startTime.toFixed(2);
        const endTime = region.endTime.toFixed(2);
        const scale = region.scale;
        
        // Calculate zoom parameters
        const zoomFactor = 1 / scale;
        const offset = (1 - zoomFactor) / 2;
        
        currentOutput = `[v${index}]`;
        
        // Add zoom effect filter
        filterComplex += `${currentInput}crop=iw*${zoomFactor}:ih*${zoomFactor}:iw*${offset}:ih*${offset},scale=${scale}*iw:${scale}*ih${currentOutput};`;
        
        currentInput = currentOutput;
      });

      // Remove last semicolon
      filterComplex = filterComplex.slice(0, -1);

      // Execute FFmpeg command with zoom effects
      await ff.exec([
        '-i', 'input.webm',
        '-filter_complex', filterComplex,
        '-c:v', 'libvpx-vp9',
        '-crf', '30',
        '-b:v', '0',
        '-c:a', 'copy',
        'output.webm'
      ]);

      // Read and return the processed video
      const data = await ff.readFile('output.webm');
      return new Blob([data], { type: 'video/webm' });
    } catch (error) {
      console.error('Error applying zoom effects:', error);
      throw error;
    }
  }
}

export const videoProcessor = VideoProcessor.getInstance(); 