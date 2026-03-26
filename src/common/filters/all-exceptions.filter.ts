import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
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

    const message =
      isHttp && (exception as HttpException).getResponse
        ? (exception as HttpException).getResponse()
        : exception;

    // Console log complet pour diagnostiquer TypeORM/DB errors
    const errAny = exception as any;
    this.logger.error(
      `[${status}] ${method} ${url}\n` +
        `message: ${JSON.stringify(message)}\n` +
        (errAny?.stack ? `stack: ${errAny.stack}` : 'stack: <none>'),
    );

    res.status(status).json(
      isHttp
        ? exception
        : {
            statusCode: status,
            message: 'Internal server error',
          },
    );
  }
}

