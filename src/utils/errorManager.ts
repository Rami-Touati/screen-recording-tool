export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

interface ErrorDetails {
  message: string;
  severity: ErrorSeverity;
  timestamp: Date;
  stack?: string;
  context?: Record<string, any>;
}

interface ErrorInput {
  message: string;
  severity: ErrorSeverity;
  stack?: string;
  context?: Record<string, any>;
}

class ErrorManager {
  private static instance: ErrorManager;
  private errors: ErrorDetails[] = [];
  private maxErrors: number = 100;
  private listeners: ((error: ErrorDetails) => void)[] = [];

  private constructor() {
    // Set up global error handlers
    window.onerror = (message, source, lineno, colno, error) => {
      this.handleError({
        message: message.toString(),
        severity: 'high',
        stack: error?.stack,
        context: {
          source,
          lineno,
          colno,
        },
      });
    };

    window.onunhandledrejection = (event) => {
      this.handleError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        severity: 'high',
        stack: event.reason?.stack,
        context: {
          reason: event.reason,
        },
      });
    };
  }

  static getInstance(): ErrorManager {
    if (!ErrorManager.instance) {
      ErrorManager.instance = new ErrorManager();
    }
    return ErrorManager.instance;
  }

  // Error handling methods
  handleError(error: ErrorInput): void {
    const errorWithTimestamp: ErrorDetails = {
      ...error,
      timestamp: new Date(),
    };

    this.errors.push(errorWithTimestamp);
    this.notifyListeners(errorWithTimestamp);

    // Log error based on severity
    this.logError(errorWithTimestamp);

    // Handle critical errors
    if (error.severity === 'critical') {
      this.handleCriticalError(errorWithTimestamp);
    }

    // Maintain error history size
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }
  }

  // Error logging methods
  private logError(error: ErrorDetails): void {
    const logMessage = `[${error.severity.toUpperCase()}] ${error.timestamp.toISOString()}: ${error.message}`;
    
    switch (error.severity) {
      case 'critical':
        console.error(logMessage, error.stack, error.context);
        break;
      case 'high':
        console.error(logMessage, error.context);
        break;
      case 'medium':
        console.warn(logMessage, error.context);
        break;
      case 'low':
        console.info(logMessage, error.context);
        break;
    }
  }

  // Error handling methods
  private handleCriticalError(error: ErrorDetails): void {
    // Notify user of critical error
    this.showErrorNotification(error);

    // Attempt to save any unsaved data
    this.saveApplicationState();

    // Log to external service if configured
    this.logToExternalService(error);
  }

  private showErrorNotification(error: ErrorDetails): void {
    // Create and show error notification
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
      <div class="error-header">
        <span class="error-severity">${error.severity.toUpperCase()}</span>
        <button class="error-close">&times;</button>
      </div>
      <div class="error-message">${error.message}</div>
      ${error.context ? `<div class="error-context">${JSON.stringify(error.context)}</div>` : ''}
    `;

    document.body.appendChild(notification);

    // Add close button functionality
    const closeButton = notification.querySelector('.error-close');
    closeButton?.addEventListener('click', () => {
      notification.remove();
    });

    // Auto-remove after 10 seconds
    setTimeout(() => {
      notification.remove();
    }, 10000);
  }

  private saveApplicationState(): void {
    // Implement application state saving logic
    // This could include saving recording progress, settings, etc.
  }

  private logToExternalService(error: ErrorDetails): void {
    // Implement external logging service integration
    // This could include services like Sentry, LogRocket, etc.
  }

  // Event listener methods
  addErrorListener(listener: (error: ErrorDetails) => void): void {
    this.listeners.push(listener);
  }

  removeErrorListener(listener: (error: ErrorDetails) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notifyListeners(error: ErrorDetails): void {
    this.listeners.forEach(listener => listener(error));
  }

  // Utility methods
  getErrors(): ErrorDetails[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }

  getErrorCount(): number {
    return this.errors.length;
  }

  getErrorsBySeverity(severity: ErrorSeverity): ErrorDetails[] {
    return this.errors.filter(error => error.severity === severity);
  }

  // Error creation helpers
  createError(message: string, severity: ErrorSeverity = 'medium', context?: Record<string, any>): ErrorDetails {
    return {
      message,
      severity,
      timestamp: new Date(),
      context,
    };
  }

  createCriticalError(message: string, context?: Record<string, any>): ErrorDetails {
    return this.createError(message, 'critical', context);
  }

  createHighSeverityError(message: string, context?: Record<string, any>): ErrorDetails {
    return this.createError(message, 'high', context);
  }

  createMediumSeverityError(message: string, context?: Record<string, any>): ErrorDetails {
    return this.createError(message, 'medium', context);
  }

  createLowSeverityError(message: string, context?: Record<string, any>): ErrorDetails {
    return this.createError(message, 'low', context);
  }
}

export const errorManager = ErrorManager.getInstance(); 