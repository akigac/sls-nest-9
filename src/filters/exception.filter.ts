import { ExceptionFilter, HttpException, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GeneralExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger();

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const requestData = ctx.getRequest<Request>();
    const responseData = ctx.getResponse<Response>();
    const httpStatusCode =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    if (exception instanceof HttpException || exception instanceof Error) {
      if (httpStatusCode === 404) {
        this.logger.error(exception);
      } else {
        // output stack trace
        this.logger.error(exception.stack ?? exception);
      }
    }

    if (exception instanceof HttpException) {
      const message = exception.message;

      return responseData.status(httpStatusCode).json({
        httpStatusCode: httpStatusCode,
        timestamp: new Date().toISOString(),
        path: requestData.url,
        response: exception.getResponse(),
        message,
      });
    }

    return responseData.status(httpStatusCode).json({
      httpStatusCode: httpStatusCode,
      timestamp: new Date().toISOString(),
      path: requestData.url,
      response: {},
      message: exception instanceof Error ? exception.message : '',
    });
  }
}
