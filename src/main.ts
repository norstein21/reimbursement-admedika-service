import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { HttpLoggerInterceptor } from './logger/http-logger.interceptor';
import { TraceMiddleware } from './logger/trace.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.use(new TraceMiddleware().use);
  app.useGlobalInterceptors(new HttpLoggerInterceptor());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
