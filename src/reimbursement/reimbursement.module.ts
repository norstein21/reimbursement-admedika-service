import { Logger, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReimbursementController } from './reimbursement.controller';
import { ReimbursementService } from './reimbursement.service';
import { ReimbursementHeader } from './entities/reimbursement-header.entity';
import { ReimbursementRepository } from './reimbursement.repository';
import { ConfigModule } from '@nestjs/config';
import { ReimbursementDetail } from './entities/reimbursement-detail.entity';
import { WinstonModule } from 'nest-winston';
import { ReimbursementAttempt } from './entities/reimbursement-attempt.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReimbursementHeader,
      ReimbursementDetail,
      ReimbursementAttempt,
    ]),
    ConfigModule,
    HttpModule,
    // WinstonModule,
  ],
  controllers: [ReimbursementController],
  providers: [ReimbursementService, ReimbursementRepository, Logger],
})
export class ReimbursementModule {}
