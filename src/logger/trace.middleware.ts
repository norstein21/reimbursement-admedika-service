import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getNamespace, createNamespace } from 'cls-hooked';

export const TRACE_NAMESPACE = 'trace';
const session = createNamespace(TRACE_NAMESPACE);

@Injectable()
export class TraceMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const traceId = req.headers['x-trace-id'] || uuidv4();
    session.run(() => {
      session.set('traceId', traceId);
      next();
    });
  }
}
export function getTraceId(): string {
  const session = getNamespace(TRACE_NAMESPACE);
  return session ? session.get('traceId') : 'no-trace';
}
//   static getSession(): any {
//     return getNamespace(TRACE_NAMESPACE);
//   }
//   static getSessionData(key: string): any {
//     const session = getNamespace(TRACE_NAMESPACE);
//     return session ? session.get(key) : null;
//   }
//   static setSessionData(key: string, value: any): void {
//     const session = getNamespace(TRACE_NAMESPACE);
//     if (session) {
//       session.set(key, value);
//     }
//   }
//   static clearSession(): void {
//     const session = getNamespace(TRACE_NAMESPACE);
//     if (session) {
//       session.set('traceId', null);
//     }
//   }
