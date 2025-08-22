// logging/logging.module.ts
import { Global, Module, Logger } from '@nestjs/common';
import { AppLogger } from '../common/nest-logger.service';

@Global()
@Module({
  providers: [{ provide: Logger, useClass: AppLogger }],
  exports: [Logger],
})
export class LoggingModule {}
