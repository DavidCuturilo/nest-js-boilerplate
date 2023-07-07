import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

export const getStatusCode = (exception: unknown): number => {
  return exception instanceof HttpException
    ? exception.getStatus()
    : HttpStatus.INTERNAL_SERVER_ERROR;
};

export const getErrorMessage = (exception: unknown): string => {
  if (exception instanceof HttpException) {
    return exception.message;
  } else {
    return String(exception);
  }
};
@Catch(HttpException)
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const code = getStatusCode(exception);
    const message = getErrorMessage(exception);

    this.logger.error(`${request.method} ${request.url}`);

    if (exception instanceof ForbiddenException) {
      this.logger.warn(`[FORBIDDEN] Request is not authenticated or allowed.`);

      response.status(403).json({
        timestamp: new Date().toISOString(),
        path: request.url,
        code: 403,
        message: 'Forbidden: Request is not authenticated or allowed.',
      });
      return;
    }
    // * Bad Request Exception
    else if (exception instanceof BadRequestException) {
      this.logger.warn(exception.message);
      let messageFormatted = JSON.stringify(
        (exception.getResponse() as any)?.message,
      );
      //regex to remove newline characters from error message
      messageFormatted = messageFormatted.replace(/,/g, '; ');
      //regex to remove escape characters from error message
      messageFormatted = messageFormatted.replace(/"/g, '');
      messageFormatted = messageFormatted.replace(/ +/g, ' ');
      messageFormatted = messageFormatted.replace(/\n/g, '');
      messageFormatted = messageFormatted.replace(/([\[\]])+/g, '');
      this.logger.warn(
        JSON.stringify((exception.getResponse() as any)?.message),
      );
      //send original response
      response.status(code).json({
        timestamp: new Date().toISOString(),
        path: request.url,
        code,
        message,
        explanation: messageFormatted,
      });
      return;
    }
    // * Entity not found / query failed error
    else if (
      exception instanceof EntityNotFoundError ||
      exception instanceof QueryFailedError
    ) {
      //regex to remove newline characters from error message
      let messageFormatted = exception.message.replace(/\n/g, '');
      //regex to remove escape characters from error message
      messageFormatted = messageFormatted.replace(/"/g, "'");
      messageFormatted = messageFormatted.replace(/ +/g, ' ');

      this.logger.error('Database error:');
      const status = exception instanceof EntityNotFoundError ? 404 : 400;
      this.logger.error(messageFormatted);

      response.status(status).json({
        timestamp: new Date().toISOString(),
        path: request.url,
        code: status,
        message:
          exception instanceof EntityNotFoundError
            ? 'Entity Not Found'
            : 'Bad Request',
      });
      return;
    } else {
      this.logger.error(exception.stack);
      response.status(code).json({
        timestamp: new Date().toISOString(),
        path: request.url,
        code,
        message,
      });
    }
  }
}
