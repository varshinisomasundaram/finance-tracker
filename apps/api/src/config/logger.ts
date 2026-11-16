import pino, { Logger } from 'pino'
import { config } from './env'

class LoggerService {
  private static instance: LoggerService
  private readonly logger: Logger

  private constructor() {
    this.logger = pino({
      level: config.get('LOG_LEVEL'),
      transport: config.isDevelopment
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
      base: {
        env: config.get('NODE_ENV'),
      },
    })
  }

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService()
    }
    return LoggerService.instance
  }

  get log(): Logger {
    return this.logger
  }

  child(bindings: Record<string, unknown>): Logger {
    return this.logger.child(bindings)
  }
}

const loggerService = LoggerService.getInstance()
export const logger = loggerService.log
export default LoggerService
