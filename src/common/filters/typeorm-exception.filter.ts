import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Response } from 'express';

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const err = exception as any;

    let message = 'Database error occurred';

    if (err.driverError && err.driverError.code) {
      switch (err.driverError.code) {
        case '23505': // Unique violation
          message = 'Duplicate entry detected';
          break;
        case '23503': // Foreign key violation
          message = 'Foreign key constraint failed';
          break;
        default:
          message = 'Database error: ' + err.driverError.message;
      }
    }

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
      message,
    });
  }
}
