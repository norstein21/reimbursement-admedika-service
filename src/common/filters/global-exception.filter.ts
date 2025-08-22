// common/filters/global-exception.filter.ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { getTraceId } from '../../logger/request-context';

// Optional: TypeORM errors (keep types loose so this compiles w/o direct imports)
type QueryFailedErrorLike = {
  name?: string;
  driverError?: any;
  message?: string;
  code?: string;
  number?: number;
};
type AxiosErrorLike = {
  isAxiosError?: boolean;
  code?: string;
  response?: { status?: number; data?: any };
  message?: string;
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const traceId = getTraceId?.();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: any = {
      traceId,
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong',
    };

    // --- 1) Nest HttpException (already has a status) ---
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resp = exception.getResponse();
      // Normalize shape (string | object)
      body =
        typeof resp === 'string'
          ? { traceId, code: this.mapHttpStatusToCode(status), message: resp }
          : { traceId, ...resp };
      return res.status(status).json(body);
    }

    // --- 2) Validation errors thrown manually as BadRequestException with class-validator details ---
    // (If you use ValidationPipe globally, they already come as HttpException; this is just a safeguard)
    if (exception instanceof BadRequestException) {
      status = HttpStatus.BAD_REQUEST;
      const resp = exception.getResponse() as any;
      body = {
        traceId,
        code: 'BAD_REQUEST',
        message: Array.isArray(resp?.message)
          ? resp.message.join(', ')
          : resp?.message || 'Bad request',
        details: resp,
      };
      return res.status(status).json(body);
    }

    // --- 3) TypeORM / SQL Server errors ---
    if (this.isTypeOrmQueryError(exception)) {
      const sqlNum = exception.driverError?.number ?? exception.number; // MSSQL error number
      const sqlMsg = exception.driverError?.message ?? exception.message;

      // Unique violation (SQL Server): 2627 (unique constraint), 2601 (unique index)
      if (sqlNum === 2627 || sqlNum === 2601) {
        status = HttpStatus.CONFLICT;
        body = {
          traceId,
          code: 'DUPLICATE',
          message: 'Resource already exists (unique constraint).',
          details: { number: sqlNum, message: sqlMsg },
        };
        return res.status(status).json(body);
      }

      // Deadlock victim
      if (sqlNum === 1205) {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        body = {
          traceId,
          code: 'DB_DEADLOCK',
          message: 'Database deadlock occurred. Please retry.',
          details: { number: sqlNum, message: sqlMsg },
        };
        return res.status(status).json(body);
      }

      // Login failed / cannot open database / connection issues (common SQL Server numbers)
      if ([18456, 4060, 53].includes(sqlNum as number)) {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        body = {
          traceId,
          code: 'DB_UNAVAILABLE',
          message: 'Database is unavailable.',
          details: { number: sqlNum, message: sqlMsg },
        };
        return res.status(status).json(body);
      }

      // Generic query error
      status = HttpStatus.BAD_REQUEST;
      body = {
        traceId,
        code: 'DB_QUERY_FAILED',
        message: 'Database query failed.',
        details: { number: sqlNum, message: sqlMsg },
      };
      return res.status(status).json(body);
    }

    // --- 4) Axios / Upstream errors ---
    if (this.isAxiosError(exception)) {
      const axiosErr = exception as AxiosErrorLike;
      const upstreamStatus = axiosErr.response?.status ?? 502;

      // Timeout
      if (axiosErr.code === 'ECONNABORTED') {
        status = HttpStatus.GATEWAY_TIMEOUT;
        body = {
          traceId,
          code: 'UPSTREAM_TIMEOUT',
          message: 'Upstream request timed out.',
          details: { code: axiosErr.code },
        };
        return res.status(status).json(body);
      }

      // Connection refused / DNS / network
      if (
        ['ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN'].includes(
          String(axiosErr.code),
        )
      ) {
        status = HttpStatus.BAD_GATEWAY;
        body = {
          traceId,
          code: 'UPSTREAM_UNREACHABLE',
          message: 'Upstream service is unreachable.',
          details: { code: axiosErr.code },
        };
        return res.status(status).json(body);
      }

      // Propagate upstream status when available
      status = this.safeHttpStatus(upstreamStatus);
      body = {
        traceId,
        code: 'UPSTREAM_ERROR',
        message: 'Upstream service returned an error.',
        upstreamStatus,
        upstreamBody: axiosErr.response?.data,
      };
      return res.status(status).json(body);
    }

    // --- 5) Node / generic errors with common codes ---
    if (
      ['ETIMEDOUT', 'ECONNREFUSED', 'ENOTFOUND', 'EPIPE'].includes(
        String(exception?.code),
      )
    ) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      body = {
        traceId,
        code: 'NETWORK_ERROR',
        message: 'A network error occurred.',
        details: { code: exception.code, message: exception.message },
      };
      return res.status(status).json(body);
    }

    // --- 6) Fallback ---
    status = HttpStatus.INTERNAL_SERVER_ERROR;
    body = {
      traceId,
      code: 'INTERNAL_ERROR',
      message: exception?.message || 'Unexpected error',
    };
    return res.status(status).json(body);
  }

  // Helpers

  private isTypeOrmQueryError(e: any): e is QueryFailedErrorLike {
    return (
      e?.name === 'QueryFailedError' ||
      !!e?.driverError ||
      typeof e?.number === 'number'
    );
  }

  private isAxiosError(e: any): e is AxiosErrorLike {
    return (
      !!e?.isAxiosError ||
      (!!e?.response && typeof e?.response?.status === 'number')
    );
  }

  private safeHttpStatus(n?: number) {
    if (!n || n < 100 || n > 599) return HttpStatus.BAD_GATEWAY;
    return n;
  }

  private mapHttpStatusToCode(status: number) {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'RATE_LIMITED';
      default:
        return 'HTTP_ERROR';
    }
  }
}
