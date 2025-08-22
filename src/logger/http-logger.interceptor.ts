import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  // Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { logger } from './winston';

// @Injectable()
// export class HttpLoggerInterceptor implements NestInterceptor {
//   private readonly logger = new Logger(HttpLoggerInterceptor.name);

//   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//     const request = context.switchToHttp().getRequest();
//     const response = context.switchToHttp().getResponse();

//     const { method, url, body } = request;
//     const startTime = Date.now();

//     return next.handle().pipe(
//       tap(() => {
//         const duration = Date.now() - startTime;
//         const message = `HTTP ${method} ${url} - ${response.statusCode} - ${duration}ms`;
//         this.logger.log({
//           method,
//           label: 'HTTP',
//           url,
//           statusCode: response.statusCode,
//           duration,
//           body,
//           message,
//         });
//       }),
//     );
//   }
// }

@Injectable()
export class HttpLoggingIntereceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const req = ctx.switchToHttp().getRequest<Request & any>();
    const res = ctx.switchToHttp().getResponse<Response & any>();

    const start = Date.now();
    const { method, originalUrl = (req as any).url, ip } = req as any;
    const userAgent = (req as any).headers?.['user-agent'];

    return next.handle().pipe(
      tap({
        next: () => {},
        error: (err) => {
          const durationMs = Date.now() - start;
          logger.error({
            type: 'http',
            msg: `${method} ${originalUrl} -> ${res?.statusCode || 500}`,
            meta: {
              method,
              path: originalUrl,
              status: res?.statusCode || 500,
              durationMs,
              bytesSent: (res as any)?.getHeader?.('content-length'),
              userAgent,
              ip,
              request_header: (req as any)?.headers,
              request_payload: (req as any)?.body,
              error: err?.message,
            },
            context: 'HTTP',
          });
        },
        complete: () => {
          const durationMs = Date.now() - start;
          logger.info({
            type: 'http',
            msg: `${method} ${originalUrl} -> ${res?.statusCode}`,
            meta: {
              method,
              path: originalUrl,
              status: res?.statusCode,
              durationMs,
              bytesSent: (res as any)?.getHeader?.('content-length'),
              userAgent,
              ip,
              request_header: (req as any)?.headers,
              request_payload: (req as any)?.body,
              response_payload: (res as any)?.body,
            },
            context: 'HTTP',
          });
        },
      }),
    );
  }
}
