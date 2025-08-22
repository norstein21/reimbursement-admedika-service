import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import { logger } from 'src/logger/winston';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger extends ConsoleLogger {
  log(message: any, context?: string) {
    logger.info({ msg: message, context, type: 'app' });
    super.log(message, context);
  }
  error(message: any, stack?: string, context?: string) {
    logger.error({ msg: message, context, type: 'app', meta: { stack } });
    super.error(message, stack, context);
  }
  warn(message: any, context?: string) {
    logger.warn({ msg: message, context, type: 'app' });
    super.warn(message, context);
  }
  debug(message: any, context?: string) {
    logger.debug({ msg: message, context, type: 'app' });
    super.debug(message, context);
  }
}
