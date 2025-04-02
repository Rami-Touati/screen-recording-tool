interface AnimationOptions {
  duration?: number;
  easing?: string;
  delay?: number;
  fill?: 'forwards' | 'backwards' | 'both' | 'none';
}

class AnimationManager {
  private static instance: AnimationManager;
  private defaultOptions: AnimationOptions = {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    delay: 0,
    fill: 'forwards',
  };

  private constructor() {}

  static getInstance(): AnimationManager {
    if (!AnimationManager.instance) {
      AnimationManager.instance = new AnimationManager();
    }
    return AnimationManager.instance;
  }

  // Fade animations
  fadeIn(element: HTMLElement, options?: AnimationOptions): Animation {
    const mergedOptions = { ...this.defaultOptions, ...options };
    return element.animate(
      [
        { opacity: 0 },
        { opacity: 1 },
      ],
      mergedOptions
    );
  }

  fadeOut(element: HTMLElement, options?: AnimationOptions): Animation {
    const mergedOptions = { ...this.defaultOptions, ...options };
    return element.animate(
      [
        { opacity: 1 },
        { opacity: 0 },
      ],
      mergedOptions
    );
  }

  // Slide animations
  slideIn(element: HTMLElement, direction: 'up' | 'down' | 'left' | 'right', options?: AnimationOptions): Animation {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const startPosition = this.getSlideStartPosition(direction);
    return element.animate(
      [
        { transform: `translate${direction === 'up' || direction === 'down' ? 'Y' : 'X'}(${startPosition})`, opacity: 0 },
        { transform: 'translate(0)', opacity: 1 },
      ],
      mergedOptions
    );
  }

  slideOut(element: HTMLElement, direction: 'up' | 'down' | 'left' | 'right', options?: AnimationOptions): Animation {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const endPosition = this.getSlideEndPosition(direction);
    return element.animate(
      [
        { transform: 'translate(0)', opacity: 1 },
        { transform: `translate${direction === 'up' || direction === 'down' ? 'Y' : 'X'}(${endPosition})`, opacity: 0 },
      ],
      mergedOptions
    );
  }

  // Scale animations
  scaleIn(element: HTMLElement, options?: AnimationOptions): Animation {
    const mergedOptions = { ...this.defaultOptions, ...options };
    return element.animate(
      [
        { transform: 'scale(0)', opacity: 0 },
        { transform: 'scale(1)', opacity: 1 },
      ],
      mergedOptions
    );
  }

  scaleOut(element: HTMLElement, options?: AnimationOptions): Animation {
    const mergedOptions = { ...this.defaultOptions, ...options };
    return element.animate(
      [
        { transform: 'scale(1)', opacity: 1 },
        { transform: 'scale(0)', opacity: 0 },
      ],
      mergedOptions
    );
  }

  // Rotate animations
  rotateIn(element: HTMLElement, options?: AnimationOptions): Animation {
    const mergedOptions = { ...this.defaultOptions, ...options };
    return element.animate(
      [
        { transform: 'rotate(-180deg)', opacity: 0 },
        { transform: 'rotate(0)', opacity: 1 },
      ],
      mergedOptions
    );
  }

  rotateOut(element: HTMLElement, options?: AnimationOptions): Animation {
    const mergedOptions = { ...this.defaultOptions, ...options };
    return element.animate(
      [
        { transform: 'rotate(0)', opacity: 1 },
        { transform: 'rotate(180deg)', opacity: 0 },
      ],
      mergedOptions
    );
  }

  // Utility method to create a custom animation
  animate(element: HTMLElement, keyframes: Keyframe[], options?: AnimationOptions): Animation {
    const mergedOptions = { ...this.defaultOptions, ...options };
    return element.animate(keyframes, mergedOptions);
  }

  // Utility method to create a sequence of animations
  async sequence(animations: Animation[]): Promise<void> {
    for (const animation of animations) {
      await animation.finished;
    }
  }

  // Utility method to create a parallel animation
  parallel(animations: Animation[]): Animation[] {
    return animations;
  }

  // Helper methods for slide animations
  private getSlideStartPosition(direction: 'up' | 'down' | 'left' | 'right'): string {
    switch (direction) {
      case 'up':
        return '100%';
      case 'down':
        return '-100%';
      case 'left':
        return '100%';
      case 'right':
        return '-100%';
    }
  }

  private getSlideEndPosition(direction: 'up' | 'down' | 'left' | 'right'): string {
    switch (direction) {
      case 'up':
        return '-100%';
      case 'down':
        return '100%';
      case 'left':
        return '-100%';
      case 'right':
        return '100%';
    }
  }
}

export const animationManager = AnimationManager.getInstance(); 