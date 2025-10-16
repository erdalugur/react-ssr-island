export class JsonLogger {
  private context?: string;
  private timers: Record<string, number> = {};

  constructor(context?: string) {
    this.context = context;
  }

  setContext(context: string) {
    this.context = context;
  }

  private log(level: string, message: string, meta?: any) {
    const entry = {
      level,
      message,
      context: this.context,
      timestamp: new Date().toISOString(),
      ...(meta ? { meta } : {})
    };
    console.log(JSON.stringify(entry));
  }

  info(message: string, meta?: any) {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: any) {
    this.log('warn', message, meta);
  }

  error(message: string, meta?: any) {
    this.log('error', message, meta);
  }

  debug(message: string, meta?: any) {
    this.log('debug', message, meta);
  }

  // Timer başlat
  time(label: string) {
    this.timers[label] = Date.now();
  }
  timeEnd(label: string) {
    const start = this.timers[label];
    if (!start) {
      this.warn(`No such timer: ${label}`);
      return;
    }
    const duration = Date.now() - start;
    this.info(`Timer ended: ${label}`, { durationMs: duration });
    delete this.timers[label];
  }
}

export function createLogger(logger?: JsonLogger, ctx: string = '') {
  if (logger) {
    const instance = new JsonLogger();
    instance.setContext(ctx);
    return Object.assign(instance, logger) as JsonLogger;
  } else {
    return new JsonLogger(ctx);
  }
}
