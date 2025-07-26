import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './logger/winston.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReimbursementModule } from './reimbursement/reimbursement.module';
import { ReimbursementMCModule } from './managed-care/reimbursement-mc.module';
import { HttpModule } from '@nestjs/axios';
import * as https from 'https';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    WinstonModule.forRoot(winstonConfig),
    HttpModule.register({
      timeout: 10000,
      httpsAgent: new https.Agent({
        secureProtocol: 'TLSv1_2_method',
      }),
    }),
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
    ReimbursementMCModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
