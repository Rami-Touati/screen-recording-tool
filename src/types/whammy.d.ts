declare module 'whammy' {
  interface WhammyOptions {
    fps?: number;
    quality?: number;
  }

  interface WhammyVideo {
    add(frame: ImageData | HTMLCanvasElement | HTMLImageElement): void;
    compile(): Blob;
  }

  export default class Whammy {
    constructor(options?: WhammyOptions);
    add(frame: ImageData | HTMLCanvasElement | HTMLImageElement): void;
    compile(): Blob;
  }
} 