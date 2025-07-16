import * as winston from 'winston';
import 'winston-daily-rotate-file';
import 'winston-mongodb';
import { getTraceId } from './trace.middleware';
import * as path from 'path';

const logFormat = winston.format.printf(
  ({ level, message, timestamp, context }) => {
    return `${timestamp} [traceId: ${getTraceId()}]  [${level.toUpperCase()}] [context: ${JSON.stringify(context)}] ${message}`;
  },
);

export const winstonConfig: winston.LoggerOptions = {
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    logFormat,
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.DailyRotateFile({
      filename: path.join(__dirname, '../../logs/%DATE%-combined.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
    new winston.transports.MongoDB({
      db: 'mongodb://mongoadmin:secret@192.168.38.165:27017',
      dbName: 'reimbursement',
      collection: 'log',
      //   level: 'info',
      tryReconnect: true,
      options: {
        useUnifiedTopology: true,
      },
      format: winston.format.combine(
        winston.format((info) => (info.label === 'HTTP' ? false : info))(), // 💡 drop HTTP logs
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    new winston.transports.MongoDB({
      db: 'mongodb://mongoadmin:secret@192.168.38.165:27017',
      dbName: 'reimbursement',
      collection: 'http_logs',
      tryReconnect: true,
      options: {
        useUnifiedTopology: true,
      },
      format: winston.format.combine(
        winston.format((info) => (info.label === 'HTTP' ? info : false))(), // 💡 drop HTTP logs
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
};
