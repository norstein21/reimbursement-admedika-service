import * as winston from 'winston';
import 'winston-daily-rotate-file';
import 'winston-mongodb';
import * as path from 'path';
import * as os from 'node:os';
import { getTraceId, getRequestId } from './request-context';

const SERVICE = process.env.SERVICE_NAME || 'reimbursement-service';
const ENV = process.env.NODE_ENV || 'dev';

const addContextFields = winston.format((info) => {
  info.ts = new Date().toISOString();
  info.service = SERVICE;
  info.env = ENV;
  info.traceId = info.traceId || getTraceId?.();
  info.requestId = info.requestId || getRequestId?.();
  info.hostname = os.hostname();
  // normalize
  info.level = String(info.level).toLowerCase();
  info.msg = info.message;
  delete info.message;
  return info;
});

const jsonFormat = winston.format.combine(
  addContextFields(),
  winston.format.errors({ stack: true }),
  winston.format((info) => {
    // ensure "type" exists; default to app
    if (!info.type) info.type = 'app';
    return info;
  })(),
  winston.format.json(),
);

const consoleDevFormat = winston.format.combine(
  addContextFields(),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const ctx = info.context ? `[${info.context}]` : '';
    const tid = info.traceId ? `traceId=${info.traceId}` : '';
    const rid = info.requestId ? `reqId=${info.requestId}` : '';
    return `${info.ts} ${info.level} ${ctx} ${tid} ${rid} - ${info.msg}`;
  }),
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    new winston.transports.Console({
      format: ENV === 'prod' ? jsonFormat : consoleDevFormat,
    }),

    new winston.transports.DailyRotateFile({
      filename: path.join(process.cwd(), 'logs/%DATE%-combined.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: jsonFormat,
    }),

    // MongoDB
    new winston.transports.MongoDB({
      db:
        process.env.MONGO_URI ||
        'mongodb://mongoadmin:secret@192.168.38.165:27017',
      dbName: 'reimbursement',
      collection: 'logs',
      tryReconnect: true,
      format: jsonFormat,
    }),
  ],
});
