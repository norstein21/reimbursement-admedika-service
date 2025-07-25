import { Module } from '@nestjs/common';
import { ReimbursementMCService } from './reimbursement-mc.service';
import { ReimbursementMCController } from './reimbursement-mc.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReimbursementMCHeader } from './entities/reimbursement-mc-header.entity';
import { ReimbursementMCDetail } from './entities/reimbursement-mc-detail.entity';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReimbursementMCHeader, ReimbursementMCDetail]),
    HttpModule,
    ConfigModule,
    WinstonModule,
  ],
  controllers: [ReimbursementMCController],
  providers: [ReimbursementMCService],
  //   exports: [ReimbursementMCService],
})
export class ReimbursementMCModule {}
