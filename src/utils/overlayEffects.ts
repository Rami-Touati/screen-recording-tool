interface OverlayOptions {
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  size: number;
  borderRadius: number;
  backgroundBlur: boolean;
  backgroundColor: string;
}

export class OverlayEffects {
  private static readonly DEFAULT_OPTIONS: OverlayOptions = {
    position: 'top-right',
    size: 200,
    borderRadius: 50,
    backgroundBlur: true,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  };

  static createOverlayContainer(options: Partial<OverlayOptions> = {}): HTMLDivElement {
    const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };
    const container = document.createElement('div');
    
    // Set container styles
    Object.assign(container.style, {
      position: 'absolute',
      width: `${mergedOptions.size}px`,
      height: `${mergedOptions.size}px`,
      borderRadius: `${mergedOptions.borderRadius}%`,
      overflow: 'hidden',
      ...this.getPositionStyles(mergedOptions.position),
    });

    // Add background blur if enabled
    if (mergedOptions.backgroundBlur) {
      container.style.backdropFilter = 'blur(8px)';
    }

    // Add background color
    container.style.backgroundColor = mergedOptions.backgroundColor;

    return container;
  }

  static createCameraFrame(videoElement: HTMLVideoElement, options: Partial<OverlayOptions> = {}): HTMLDivElement {
    const container = this.createOverlayContainer(options);
    
    // Style the video element
    Object.assign(videoElement.style, {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: 'inherit',
    });

    container.appendChild(videoElement);
    return container;
  }

  static createBackgroundOverlay(options: {
    type: 'gradient' | 'blur' | 'color';
    color?: string;
    gradient?: string;
    blurAmount?: number;
  }): HTMLDivElement {
    const overlay = document.createElement('div');
    
    Object.assign(overlay.style, {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 1,
    });

    switch (options.type) {
      case 'gradient':
        overlay.style.background = options.gradient || 'linear-gradient(45deg, rgba(0,0,0,0.2), rgba(0,0,0,0.1))';
        break;
      case 'blur':
        overlay.style.backdropFilter = `blur(${options.blurAmount || 8}px)`;
        break;
      case 'color':
        overlay.style.backgroundColor = options.color || 'rgba(0, 0, 0, 0.3)';
        break;
    }

    return overlay;
  }

  private static getPositionStyles(position: OverlayOptions['position']): Partial<CSSStyleDeclaration> {
    const padding = 20;
    switch (position) {
      case 'top-right':
        return {
          top: `${padding}px`,
          right: `${padding}px`,
        };
      case 'top-left':
        return {
          top: `${padding}px`,
          left: `${padding}px`,
        };
      case 'bottom-right':
        return {
          bottom: `${padding}px`,
          right: `${padding}px`,
        };
      case 'bottom-left':
        return {
          bottom: `${padding}px`,
          left: `${padding}px`,
        };
      default:
        return {
          top: `${padding}px`,
          right: `${padding}px`,
        };
    }
  }

  static applyZoomEffect(element: HTMLElement, zoomLevel: number, duration: number = 300): void {
    element.style.transition = `transform ${duration}ms ease-in-out`;
    element.style.transform = `scale(${zoomLevel})`;
  }

  static createTransitionEffect(element: HTMLElement, options: {
    property: string;
    from: string | number;
    to: string | number;
    duration: number;
    easing?: string;
  }): void {
    const { property, from, to, duration, easing = 'ease-in-out' } = options;
    
    element.style.transition = `${property} ${duration}ms ${easing}`;
    element.style[property as any] = from.toString();
    
    // Force reflow
    element.offsetHeight;
    
    element.style[property as any] = to.toString();
  }
} 