import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReimbursementMCHeader } from './entities/reimbursement-mc-header.entity';
import { DataSource, Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CreateReimbursementMCDto } from './dto/create-reimbursement-mc.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class ReimbursementMCService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    @InjectRepository(ReimbursementMCHeader)
    private headerRepository: Repository<ReimbursementMCHeader>,
    private http: HttpService,
    private readonly dataSource: DataSource,
    // private config: ConfigService,
  ) {}

  async submitMCClaim(data: CreateReimbursementMCDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const header = new ReimbursementMCHeader();
      Object.assign(header, data);
      console.log('sampe sini?');
      const savedHeader = await queryRunner.manager.save(header);
      this.logger.log(
        `MC claim submitted with header ID: ${savedHeader.id}`,
        'ReimbursementMCService',
      );

      const response = await this.http.axiosRef.post(
        process.env.ADMEDIKA_MANAGED_CARE_URL ?? '',
        data,
        {
          headers: { 'X-API-TOKEN': process.env.ADMEDIKA_X_API_TOKEN_MC ?? '' },
        },
      );

      if (response.data.code == 500) {
        await queryRunner.rollbackTransaction();
        return {
          savedId: savedHeader.id,
          responseData: response.data ?? null,
          responseStatus: response.status,
          message: response.data.message,
        };
      }

      await queryRunner.commitTransaction();

      this.logger.log('MC claim submitted successfully', {
        savedId: savedHeader.id,
        response: response.data,
      });

      return {
        savedId: savedHeader.id,
        responseData: response.data ?? null,
        responseStatus: response.status,
        message: 'Success sent request',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error submitting MC claim', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
