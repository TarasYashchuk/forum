import { Injectable } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';

@Injectable()
export class WinstonLoggerService {
  private readonly logger;

  constructor() {
    this.logger = createLogger({
      format: format.combine(format.timestamp(), format.json()),
      transports: [
        new transports.File({ filename: 'logs/actions.log' }),
        new transports.Console(),
      ],
    });
  }

  logAction(action: string, userId: number, details: any) {
    this.logger.info({ action, userId, details });
  }
}
