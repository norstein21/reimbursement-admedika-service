type BaseLog = {
  ts: string; // ISO timestamp
  level: string; // info|error|warn|debug
  msg: string; // message
  service: string; // your service name
  env: string; // dev|staging|prod
  traceId?: string; // from ALS
  requestId?: string; // from ALS
  context?: string; // free-form Nest context or logger label
  type: 'app' | 'http'; // event type
  meta?: any; // extra structured data
};
