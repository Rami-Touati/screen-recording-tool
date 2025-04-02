interface ShortcutHandler {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  handler: () => void;
}

class KeyboardShortcuts {
  private shortcuts: ShortcutHandler[] = [];

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  addShortcut(shortcut: ShortcutHandler): void {
    this.shortcuts.push(shortcut);
  }

  removeShortcut(key: string): void {
    this.shortcuts = this.shortcuts.filter(shortcut => shortcut.key !== key);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const matchingShortcut = this.shortcuts.find(shortcut => {
      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatch = !shortcut.ctrlKey || event.ctrlKey;
      const shiftMatch = !shortcut.shiftKey || event.shiftKey;
      const altMatch = !shortcut.altKey || event.altKey;
      const metaMatch = !shortcut.metaKey || event.metaKey;

      return keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch;
    });

    if (matchingShortcut) {
      event.preventDefault();
      matchingShortcut.handler();
    }
  }

  cleanup(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
  }
}

export const keyboardShortcuts = new KeyboardShortcuts();

// Default shortcuts
keyboardShortcuts.addShortcut({
  key: 'z',
  ctrlKey: true,
  handler: () => {
    // Zoom in handler
    window.electron.send('zoom-in');
  },
});

keyboardShortcuts.addShortcut({
  key: 'z',
  ctrlKey: true,
  shiftKey: true,
  handler: () => {
    // Zoom out handler
    window.electron.send('zoom-out');
  },
});

keyboardShortcuts.addShortcut({
  key: 'r',
  ctrlKey: true,
  handler: () => {
    // Start/Stop recording handler
    window.electron.send('toggle-recording');
  },
});

keyboardShortcuts.addShortcut({
  key: 'c',
  ctrlKey: true,
  handler: () => {
    // Toggle camera handler
    window.electron.send('toggle-camera');
  },
});

keyboardShortcuts.addShortcut({
  key: ' ',
  handler: () => {
    // Play/Pause preview handler
    window.electron.send('toggle-playback');
  },
});

keyboardShortcuts.addShortcut({
  key: 'Escape',
  handler: () => {
    // Exit preview handler
    window.electron.send('exit-preview');
  },
}); 