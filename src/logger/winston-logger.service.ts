import { Injectable } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class WinstonLoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' }),
      ],
    });
  }

  log(message: string, context?: any) {
    this.logger.info(message, { context });
  }

  error(message: string) {
    this.logger.error(message);
  }

  warn(message: string, context?: any) {
    this.logger.warn(message, { context });
  }
}
