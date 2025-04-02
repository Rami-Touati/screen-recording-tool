export type Theme = 'light' | 'dark' | 'system';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

const lightColors: ThemeColors = {
  primary: '#3B82F6',
  secondary: '#6B7280',
  background: '#FFFFFF',
  surface: '#F3F4F6',
  text: '#111827',
  textSecondary: '#4B5563',
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
};

const darkColors: ThemeColors = {
  primary: '#60A5FA',
  secondary: '#9CA3AF',
  background: '#111827',
  surface: '#1F2937',
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  border: '#374151',
  error: '#F87171',
  success: '#34D399',
  warning: '#FBBF24',
  info: '#60A5FA',
};

class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: Theme = 'system';
  private colors: ThemeColors = lightColors;

  private constructor() {
    this.initializeTheme();
  }

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  private initializeTheme(): void {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light');
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (this.currentTheme === 'system') {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  setTheme(theme: Theme): void {
    this.currentTheme = theme;
    localStorage.setItem('theme', theme);

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.colors = prefersDark ? darkColors : lightColors;
    } else {
      this.colors = theme === 'dark' ? darkColors : lightColors;
    }

    this.applyTheme();
  }

  getTheme(): Theme {
    return this.currentTheme;
  }

  getColors(): ThemeColors {
    return this.colors;
  }

  private applyTheme(): void {
    const root = document.documentElement;
    Object.entries(this.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }

  // Utility methods for common color operations
  getPrimaryColor(): string {
    return this.colors.primary;
  }

  getBackgroundColor(): string {
    return this.colors.background;
  }

  getTextColor(): string {
    return this.colors.text;
  }

  getSurfaceColor(): string {
    return this.colors.surface;
  }

  getBorderColor(): string {
    return this.colors.border;
  }

  // Method to generate CSS variables for Tailwind
  getTailwindConfig(): Record<string, string> {
    return {
      '--primary': this.colors.primary,
      '--secondary': this.colors.secondary,
      '--background': this.colors.background,
      '--surface': this.colors.surface,
      '--text': this.colors.text,
      '--text-secondary': this.colors.textSecondary,
      '--border': this.colors.border,
      '--error': this.colors.error,
      '--success': this.colors.success,
      '--warning': this.colors.warning,
      '--info': this.colors.info,
    };
  }
}

export const themeManager = ThemeManager.getInstance(); 