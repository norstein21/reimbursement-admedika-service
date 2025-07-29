import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReimbursementController } from './reimbursement.controller';
import { ReimbursementService } from './reimbursement.service';
import { ReimbursementHeader } from './entities/reimbursement-header.entity';
import { ReimbursementRepository } from './reimbursement.repository';
import { ConfigModule } from '@nestjs/config';
import { ReimbursementDetail } from './entities/reimbursement-detail.entity';
import { DataSource } from 'typeorm';
import { WinstonModule } from 'nest-winston';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReimbursementHeader, ReimbursementDetail]),
    ConfigModule,
    HttpModule,
    WinstonModule,
  ],
  controllers: [ReimbursementController],
  providers: [
    ReimbursementService,
    // {
    //   provide: 'REIMBURSEMENT_REPOSITORY',
    //   inject: [DataSource],
    //   useFactory: (dataSource) => new ReimbursementRepository(dataSource),
    // },
    ReimbursementRepository,
  ],
  // exports: ['REIMBURSEMENT_REPOSITORY'],
})
export class ReimbursementModule {}
