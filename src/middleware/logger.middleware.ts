import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private logger: Logger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const baseUrl = req.baseUrl;
    const method = req.method;
    const startTimestamp = Date.now();

    this.logger.debug(`${method} called on route ${baseUrl}`);

    if (method === 'POST' && req.body) {
      this.logger.debug(`Request body: ${JSON.stringify(req.body)}`);
    } else if (
      req.method === 'GET' &&
      req.query &&
      Object.keys(req.query).length > 0
    ) {
      if (typeof req.query === 'object') {
        this.logger.verbose(`Query: ${JSON.stringify(req.query)}`);
      } else {
        this.logger.verbose(`Query: ${req.query}`);
      }
    }

    res.on('finish', () => {
      const endTimestamp = Date.now();

      this.logger.debug(
        `${method} ${baseUrl} finished in ${endTimestamp - startTimestamp}ms`,
        'LoggerMiddleware',
      );
    });

    next();
  }
}
