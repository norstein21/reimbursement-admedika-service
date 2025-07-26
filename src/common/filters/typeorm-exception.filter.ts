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
    const request = ctx.getRequest<Request>();

    const err = exception as any;

    let message = 'Database error occurred';
    let column: string | null = null;

    if (err.driverError && err.driverError.code) {
      const code = err.driverError.code;
      const detail = err.driverError.detail || '';
      const errorMessage = err.driverError.message || '';

      switch (code) {
        case '23505': // Unique violation
          message = 'Duplicate entry detected';
          column = this.extractColumnFromDetail(detail);
          break;
        case '23503': // Foreign key violation
          message = 'Foreign key constraint failed';
          column = this.extractConstraintName(errorMessage);
          break;
        default:
          message = 'Database error: ' + errorMessage;
      }
    }

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      ...(column && { column }), // include column only if exists
      debug: {
        driverError: err.driverError?.message,
        detail: err.driverError?.detail,
        parameters: err.driverError?.parameters,
      },
    });
  }

  private extractColumnFromDetail(detail: string): string | null {
    const match = detail.match(/\(([^)]+)\)=\([^)]+\)/);
    return match ? match[1] : null;
  }

  private extractConstraintName(errorMessage: string): string | null {
    const match = errorMessage.match(/constraint "([^"]+)"/);
    return match ? match[1] : null;
  }
}
