interface ShortcutHandler {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: () => void;
  description: string;
}

interface InputOptions {
  preventDefault?: boolean;
  stopPropagation?: boolean;
  capture?: boolean;
}

class InputManager {
  private static instance: InputManager;
  private shortcuts: Map<string, ShortcutHandler> = new Map();
  private isEnabled: boolean = true;
  private options: InputOptions = {
    preventDefault: true,
    stopPropagation: true,
    capture: false,
  };

  private constructor() {
    this.setupDefaultShortcuts();
    this.setupEventListeners();
  }

  static getInstance(): InputManager {
    if (!InputManager.instance) {
      InputManager.instance = new InputManager();
    }
    return InputManager.instance;
  }

  // Shortcut management methods
  addShortcut(shortcut: ShortcutHandler): void {
    const key = this.generateShortcutKey(shortcut);
    this.shortcuts.set(key, shortcut);
  }

  removeShortcut(key: string, ctrl?: boolean, shift?: boolean, alt?: boolean, meta?: boolean): void {
    const shortcutKey = this.generateShortcutKey({ key, ctrl, shift, alt, meta, handler: () => {}, description: '' });
    this.shortcuts.delete(shortcutKey);
  }

  updateShortcut(oldShortcut: ShortcutHandler, newShortcut: ShortcutHandler): void {
    const oldKey = this.generateShortcutKey(oldShortcut);
    const newKey = this.generateShortcutKey(newShortcut);
    this.shortcuts.delete(oldKey);
    this.shortcuts.set(newKey, newShortcut);
  }

  // Input management methods
  enable(): void {
    this.isEnabled = true;
  }

  disable(): void {
    this.isEnabled = false;
  }

  setOptions(options: Partial<InputOptions>): void {
    this.options = { ...this.options, ...options };
  }

  // Event handling methods
  private setupEventListeners(): void {
    window.addEventListener('keydown', this.handleKeyDown.bind(this), this.options.capture);
    window.addEventListener('keyup', this.handleKeyUp.bind(this), this.options.capture);
    window.addEventListener('mousedown', this.handleMouseDown.bind(this), this.options.capture);
    window.addEventListener('mouseup', this.handleMouseUp.bind(this), this.options.capture);
    window.addEventListener('wheel', this.handleWheel.bind(this), this.options.capture);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isEnabled) return;

    const shortcut = this.findMatchingShortcut(event);
    if (shortcut) {
      if (this.options.preventDefault) {
        event.preventDefault();
      }
      if (this.options.stopPropagation) {
        event.stopPropagation();
      }
      shortcut.handler();
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    // Handle key up events if needed
  }

  private handleMouseDown(event: MouseEvent): void {
    // Handle mouse down events if needed
  }

  private handleMouseUp(event: MouseEvent): void {
    // Handle mouse up events if needed
  }

  private handleWheel(event: WheelEvent): void {
    // Handle wheel events if needed
  }

  // Utility methods
  private generateShortcutKey(shortcut: ShortcutHandler): string {
    const modifiers = [];
    if (shortcut.ctrl) modifiers.push('Ctrl');
    if (shortcut.shift) modifiers.push('Shift');
    if (shortcut.alt) modifiers.push('Alt');
    if (shortcut.meta) modifiers.push('Meta');
    modifiers.push(shortcut.key.toUpperCase());
    return modifiers.join('+');
  }

  private findMatchingShortcut(event: KeyboardEvent): ShortcutHandler | undefined {
    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey;
    const shift = event.shiftKey;
    const alt = event.altKey;
    const meta = event.metaKey;

    for (const shortcut of this.shortcuts.values()) {
      if (
        shortcut.key.toLowerCase() === key &&
        shortcut.ctrl === ctrl &&
        shortcut.shift === shift &&
        shortcut.alt === alt &&
        shortcut.meta === meta
      ) {
        return shortcut;
      }
    }

    return undefined;
  }

  // Default shortcuts setup
  private setupDefaultShortcuts(): void {
    // Recording shortcuts
    this.addShortcut({
      key: 'r',
      ctrl: true,
      handler: () => window.electron.startRecording({
        videoSource: 'screen',
        audioSource: 'default',
        cameraEnabled: false,
        resolution: { width: 1920, height: 1080 },
        fps: 30,
      }),
      description: 'Start Recording',
    });

    this.addShortcut({
      key: 'r',
      ctrl: true,
      shift: true,
      handler: () => window.electron.stopRecording(),
      description: 'Stop Recording',
    });

    // Camera shortcuts
    this.addShortcut({
      key: 'c',
      ctrl: true,
      handler: () => {
        // Toggle camera
      },
      description: 'Toggle Camera',
    });

    // Preview shortcuts
    this.addShortcut({
      key: 'p',
      ctrl: true,
      handler: () => {
        // Play preview
      },
      description: 'Play Preview',
    });

    this.addShortcut({
      key: 'p',
      ctrl: true,
      shift: true,
      handler: () => {
        // Pause preview
      },
      description: 'Pause Preview',
    });

    // Export shortcuts
    this.addShortcut({
      key: 'e',
      ctrl: true,
      handler: () => {
        // Export to MP4
      },
      description: 'Export to MP4',
    });

    this.addShortcut({
      key: 'e',
      ctrl: true,
      shift: true,
      handler: () => {
        // Export to GIF
      },
      description: 'Export to GIF',
    });

    // Navigation shortcuts
    this.addShortcut({
      key: 'ArrowLeft',
      ctrl: true,
      handler: () => {
        // Previous page
      },
      description: 'Previous Page',
    });

    this.addShortcut({
      key: 'ArrowRight',
      ctrl: true,
      handler: () => {
        // Next page
      },
      description: 'Next Page',
    });

    // Settings shortcuts
    this.addShortcut({
      key: ',',
      ctrl: true,
      handler: () => {
        // Open settings
      },
      description: 'Open Settings',
    });
  }

  // Cleanup methods
  cleanup(): void {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this), this.options.capture);
    window.removeEventListener('keyup', this.handleKeyUp.bind(this), this.options.capture);
    window.removeEventListener('mousedown', this.handleMouseDown.bind(this), this.options.capture);
    window.removeEventListener('mouseup', this.handleMouseUp.bind(this), this.options.capture);
    window.removeEventListener('wheel', this.handleWheel.bind(this), this.options.capture);
  }
}

export const inputManager = InputManager.getInstance(); 