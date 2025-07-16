import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './logger/winston.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReimbursementModule } from './reimbursement/reimbursement.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    WinstonModule.forRoot(winstonConfig),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mssql',
        host: configuration().database.host,
        username: configuration().database.username,
        password: configuration().database.password,
        database: configuration().database.database,
        autoLoadEntities: true,
        synchronize: true, // Set to false in production
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
      }),
    }),
    ReimbursementModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
