export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
}

class GameLogger {
  private static instance: GameLogger;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  private constructor() {}

  static getInstance(): GameLogger {
    if (!GameLogger.instance) {
      GameLogger.instance = new GameLogger();
    }
    return GameLogger.instance;
  }

  private log(level: LogLevel, category: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      data
    };

    this.logs.push(entry);
    
    // Keep logs under maxLogs limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Also log to console with appropriate method
    const consoleData = data ? [message, data] : [message];
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`[${category}]`, ...consoleData);
        break;
      case LogLevel.INFO:
        console.info(`[${category}]`, ...consoleData);
        break;
      case LogLevel.WARN:
        console.warn(`[${category}]`, ...consoleData);
        break;
      case LogLevel.ERROR:
        console.error(`[${category}]`, ...consoleData);
        break;
    }

    // Store in localStorage for persistence
    this.persistLogs();
  }

  debug(category: string, message: string, data?: any) {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  info(category: string, message: string, data?: any) {
    this.log(LogLevel.INFO, category, message, data);
  }

  warn(category: string, message: string, data?: any) {
    this.log(LogLevel.WARN, category, message, data);
  }

  error(category: string, message: string, data?: any) {
    this.log(LogLevel.ERROR, category, message, data);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    return level 
      ? this.logs.filter(log => log.level === level)
      : [...this.logs];
  }

  getLatestLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  clearLogs(): void {
    this.logs = [];
    localStorage.removeItem('gameLogs');
  }

  private persistLogs(): void {
    localStorage.setItem('gameLogs', JSON.stringify(this.logs));
  }

  loadPersistedLogs(): void {
    const savedLogs = localStorage.getItem('gameLogs');
    if (savedLogs) {
      try {
        this.logs = JSON.parse(savedLogs);
      } catch (error) {
        console.error('Error loading persisted logs:', error);
        this.logs = [];
      }
    }
  }
}

export const logger = GameLogger.getInstance(); 