export class UniversalLogger {
  private static instance: UniversalLogger;
  private constructor() {}

  public static getInstance(): UniversalLogger {
    if (!UniversalLogger.instance) {
      UniversalLogger.instance = new UniversalLogger();
    }
    return UniversalLogger.instance;
  }

  private getCallerInfo(): { className: string; methodName: string; lineNumber: string } | null {
    const stack = new Error().stack;
    if (!stack) return null;

    const stackLines = stack.split('\n');
    // Skip the first line (Error) and look for the first non-logger caller
    for (let i = 2; i < stackLines.length; i++) {
      const line = stackLines[i];
      // Skip lines containing UniversalLogger
      if (line.includes('UniversalLogger')) continue;
      
      // Try different patterns to match various caller formats
      const patterns = [
        // Class.method format
        /at\s+(\w+)(?:\.(\w+))?\s+\(.*:(\d+):\d+\)/,
        // React component format
        /at\s+(\w+)\s+\(.*:(\d+):\d+\)/,
        // Anonymous function format
        /at\s+<(\w+)>\s+\(.*:(\d+):\d+\)/,
        // Function name format
        /at\s+(\w+)\s+\(.*:(\d+):\d+\)/,
        // Arrow function format
        /at\s+\(.*\)\s+\(.*:(\d+):\d+\)/
      ];

      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          const [, className, methodName, lineNumber] = match;
          // For React components and anonymous functions, className will be the function name
          return {
            className: className || 'Anonymous',
            methodName: methodName || '',
            lineNumber: lineNumber || '0'
          };
        }
      }
    }
    return null;
  }

  private formatCallerInfo(callerInfo: { className: string; methodName: string; lineNumber: string }): string {
    const { className, methodName, lineNumber } = callerInfo;
    const formattedMethod = methodName ? `.${methodName}` : '';
    return `[${className}${formattedMethod}:${lineNumber}]`;
  }

  public log(...args: any[]): void {
    const callerInfo = this.getCallerInfo();
    
    // Format the message and additional parameters
    const formattedArgs = args.map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    if (callerInfo) {
      console.log(this.formatCallerInfo(callerInfo), formattedArgs);
    } else {
      console.log(`[Unknown]`, formattedArgs);
    }
  }

  public info(...args: any[]): void {
    this.log('INFO:', ...args);
  }

  public warn(...args: any[]): void {
    this.log('WARN:', ...args);
  }

  public error(...args: any[]): void {
    this.log('ERROR:', ...args);
  }

  public debug(...args: any[]): void {
    this.log('DEBUG:', ...args);
  }
} 