import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { HttpLoggingIntereceptor } from './logger/http-logger.interceptor';
import { TraceMiddleware } from './logger/trace.middleware';
import { TypeOrmExceptionFilter } from './common/filters/typeorm-exception.filter';
import { requestContext } from './logger/request-context';
import { Http } from 'winston/lib/winston/transports';
import { Logger, ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = await app.resolve(Logger);
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // app.useGlobalPipes(
  //   // make sure global ValidationPipe is ON (transform:true!)
  //   new ValidationPipe({
  //     whitelist: true,
  //     forbidNonWhitelisted: false,
  //     transform: true,
  //     transformOptions: { enableImplicitConversion: true },
  //   }),
  // );
  app.use(requestContext());
  app.useLogger(logger);
  // app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.use(new TraceMiddleware().use);
  app.useGlobalInterceptors(new HttpLoggingIntereceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());
  // app.useGlobalFilters(new TypeOrmExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
