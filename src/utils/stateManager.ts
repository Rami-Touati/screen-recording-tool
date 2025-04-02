type StateChangeListener<T> = (newState: T, oldState: T) => void;

interface StateOptions {
  persist?: boolean;
  storageKey?: string;
}

class StateManager<T extends Record<string, any>> {
  private static instance: StateManager<any>;
  private state: T;
  private listeners: Map<keyof T, Set<StateChangeListener<any>>> = new Map();
  private options: StateOptions;

  private constructor(initialState: T, options: StateOptions = {}) {
    this.options = options;
    this.state = this.loadState(initialState);
  }

  static getInstance<T extends Record<string, any>>(initialState: T, options?: StateOptions): StateManager<T> {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager(initialState, options);
    }
    return StateManager.instance as StateManager<T>;
  }

  // State access methods
  getState(): T {
    return { ...this.state };
  }

  get<K extends keyof T>(key: K): T[K] {
    return this.state[key];
  }

  // State update methods
  setState(newState: Partial<T>): void {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...newState };
    this.notifyListeners(oldState);
    this.saveState();
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    const oldState = { ...this.state };
    this.state[key] = value;
    this.notifyListeners(oldState);
    this.saveState();
  }

  // State reset methods
  resetState(): void {
    const oldState = { ...this.state };
    this.state = this.getInitialState();
    this.notifyListeners(oldState);
    this.saveState();
  }

  reset<K extends keyof T>(key: K): void {
    const oldState = { ...this.state };
    this.state[key] = this.getInitialState()[key];
    this.notifyListeners(oldState);
    this.saveState();
  }

  // State subscription methods
  subscribe<K extends keyof T>(key: K, listener: StateChangeListener<T[K]>): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);

    return () => {
      this.listeners.get(key)?.delete(listener);
    };
  }

  subscribeToAll(listener: StateChangeListener<T>): () => void {
    const unsubscribeFns = Object.keys(this.state).map(key => 
      this.subscribe(key as keyof T, (newValue, oldValue) => {
        listener(this.state, { ...this.state, [key]: oldValue });
      })
    );

    return () => {
      unsubscribeFns.forEach(fn => fn());
    };
  }

  // State persistence methods
  private loadState(initialState: T): T {
    if (!this.options.persist || !this.options.storageKey) {
      return initialState;
    }

    try {
      const savedState = localStorage.getItem(this.options.storageKey);
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (error) {
      console.error('Error loading state:', error);
    }

    return initialState;
  }

  private saveState(): void {
    if (!this.options.persist || !this.options.storageKey) {
      return;
    }

    try {
      localStorage.setItem(this.options.storageKey, JSON.stringify(this.state));
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }

  // State initialization methods
  private getInitialState(): T {
    return this.loadState(this.state);
  }

  // State notification methods
  private notifyListeners(oldState: T): void {
    Object.keys(this.state).forEach(key => {
      const newValue = this.state[key as keyof T];
      const oldValue = oldState[key as keyof T];

      if (newValue !== oldValue) {
        this.listeners.get(key as keyof T)?.forEach(listener => {
          listener(newValue, oldValue);
        });
      }
    });
  }

  // State validation methods
  isValid<K extends keyof T>(key: K, value: T[K]): boolean {
    // Implement custom validation logic here
    return true;
  }

  // State transformation methods
  transform<K extends keyof T>(key: K, transformer: (value: T[K]) => T[K]): void {
    const oldState = { ...this.state };
    this.state[key] = transformer(this.state[key]);
    this.notifyListeners(oldState);
    this.saveState();
  }

  // State debugging methods
  debug(): void {
    console.log('Current State:', this.state);
    console.log('Listeners:', Object.fromEntries(this.listeners));
  }
}

// Example usage:
/*
interface AppState {
  isRecording: boolean;
  selectedDevice: string;
  settings: {
    resolution: string;
    fps: number;
  };
}

const initialState: AppState = {
  isRecording: false,
  selectedDevice: '',
  settings: {
    resolution: '1080p',
    fps: 30,
  },
};

const stateManager = StateManager.getInstance(initialState, {
  persist: true,
  storageKey: 'app-state',
});

// Subscribe to specific state changes
const unsubscribe = stateManager.subscribe('isRecording', (newValue, oldValue) => {
  console.log('Recording state changed:', oldValue, '->', newValue);
});

// Subscribe to all state changes
const unsubscribeAll = stateManager.subscribeToAll((newState, oldState) => {
  console.log('State changed:', oldState, '->', newState);
});

// Update state
stateManager.setState({
  isRecording: true,
  settings: {
    ...stateManager.get('settings'),
    fps: 60,
  },
});

// Cleanup
unsubscribe();
unsubscribeAll();
*/

export { StateManager }; 