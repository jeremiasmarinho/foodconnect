import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, body, query, params } = request;
    const userAgent = request.get('User-Agent') || '';
    const ip = request.ip;

    const startTime = Date.now();

    // Log incoming request
    this.logger.log(`➡️  ${method} ${url} - ${ip} - ${userAgent}`, 'REQUEST');

    if (process.env.NODE_ENV === 'development') {
      if (Object.keys(body || {}).length > 0) {
        this.logger.debug(`Request Body: ${JSON.stringify(body)}`);
      }
      if (Object.keys(query || {}).length > 0) {
        this.logger.debug(`Query Params: ${JSON.stringify(query)}`);
      }
      if (Object.keys(params || {}).length > 0) {
        this.logger.debug(`Route Params: ${JSON.stringify(params)}`);
      }
    }

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;

        // Log successful response
        this.logger.log(
          `⬅️  ${method} ${url} - ${statusCode} - ${duration}ms`,
          'RESPONSE',
        );

        if (process.env.NODE_ENV === 'development' && data) {
          this.logger.debug(`Response Data: ${JSON.stringify(data)}`);
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode = error.status || 500;

        // Log error response
        this.logger.error(
          `❌ ${method} ${url} - ${statusCode} - ${duration}ms - ${error.message}`,
          error.stack,
          'ERROR',
        );

        throw error;
      }),
    );
  }
}
