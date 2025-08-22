import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import { Request, Response, NextFunction } from 'express';

type Ctx = { traceId: string; requestId: string };

const als = new AsyncLocalStorage<Ctx>();

export function getTraceId() {
  return als.getStore()?.traceId;
}

export function getRequestId() {
  return als.getStore()?.requestId;
}

export function requestContext() {
  return (req: Request, res: Response, next: NextFunction) => {
    const traceId = (req.headers['x-trace-id'] as string) || randomUUID();
    const requestId = (req.headers['x-request-id'] as string) || randomUUID();

    res.setHeader('x-trace-id', traceId);
    res.setHeader('x-request-id', requestId);

    als.run({ traceId, requestId }, () => next());
  };
}
