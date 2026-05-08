import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('AllExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const method = req.method;
    const url = req.originalUrl || req.url;

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : 500;

    let message: unknown;
    if (isHttp) {
      const response = exception.getResponse();
      message = typeof response === 'string' ? response : response;
    } else {
      message = (exception as Error)?.message || 'Internal server error';
    }

    const errAny = exception as any;
    this.logger.error(
      `[${status}] ${method} ${url}\n` +
        `message: ${JSON.stringify(message)}\n` +
        (errAny?.stack ? `stack: ${errAny.stack}` : 'stack: <none>'),
    );

    res.status(status).json(
      isHttp
        ? typeof exception.getResponse === 'function' && typeof exception.getResponse() === 'object'
          ? exception.getResponse()
          : { statusCode: status, message: message }
        : {
            statusCode: status,
            message: 'Internal server error',
          },
    );
  }
}
