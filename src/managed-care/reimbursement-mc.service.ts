import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReimbursementMCHeader } from './entities/reimbursement-mc-header.entity';
import { DataSource, Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CreateReimbursementMCDto } from './dto/create-reimbursement-mc.dto';
// import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class ReimbursementMCService {
  constructor(
    // @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,

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
      const savedHeader = await queryRunner.manager.save(header);

      const mergeDetails = data.CLAIM_DETAIL_LIST.map((detail) => ({
        ...detail,
        KD_PLAN: data.KD_PLAN,
        NO_POLIS: data.NO_POLIS,
        KD_HOLDING: data.KD_HOLDING,
        KD_PLAN_DTL: data.KD_PLAN_DTL,
        INSURANCE_NO: data.INSURANCE_NO,
        KD_CUS_CLIENT: data.KD_CUS_CLIENT,
        CLAIM_NO_PAYOR: data.CLAIM_NO_PAYOR,
      }));

      const dataWithDetails = {
        ...data,
        CLAIM_DETAIL_LIST: mergeDetails,
      };

      this.logger.log(`MC claim submitted with header ID: ${savedHeader.id}`);

      const response = await this.http.axiosRef.post(
        process.env.ADMEDIKA_MANAGED_CARE_URL ?? '',
        dataWithDetails,
        {
          headers: { 'X-API-TOKEN': process.env.ADMEDIKA_X_API_TOKEN_MC ?? '' },
        },
      );

      const requestStatus = response.data.code > 200 ? 0 : 1;

      await queryRunner.manager.update(
        ReimbursementMCHeader,
        { id: savedHeader.id },
        {
          request_status: requestStatus,
        },
      );

      if (response.data.code == 500) {
        // await queryRunner.rollbackTransaction();
        await queryRunner.commitTransaction();
        console.log('sampe sini');
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
      console.error(error);
      await queryRunner.rollbackTransaction();
      this.logger.error('Error submitting MC claim', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
