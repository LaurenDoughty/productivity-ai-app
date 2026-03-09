/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Log entry structure
 */
export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Structured logger
 */
export class Logger {
  private buffer: LogEntry[] = [];
  private readonly maxBufferSize = 100;

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      context: {
        ...context,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      },
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    };

    this.buffer.push(entry);
    console.error(JSON.stringify(entry));

    // Auto-flush if buffer is full
    if (this.buffer.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  /**
   * Log a message with specified level
   */
  private log(level: 'info' | 'warn', message: string, context?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    this.buffer.push(entry);

    if (level === 'warn') {
      console.warn(JSON.stringify(entry));
    } else {
      console.log(JSON.stringify(entry));
    }

    // Auto-flush if buffer is full
    if (this.buffer.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  /**
   * Flush buffered logs
   * In production, this would send logs to CloudWatch
   */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) {
      return;
    }

    // In production, send to CloudWatch
    if (import.meta.env.PROD) {
      try {
        // TODO: Implement CloudWatch integration
        console.log(`Flushing ${this.buffer.length} log entries to CloudWatch`);
      } catch (error) {
        console.error('Failed to flush logs to CloudWatch:', error);
      }
    }

    this.buffer = [];
  }
}

// Export singleton instance
export const logger = new Logger();
