import { Injectable, LoggerService, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { ReimbursementHeader } from './entities/reimbursement-header.entity';
import { CreateReimbursementDto } from './dto/create-reimbursement.dto';
import { DataSource, Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ReimbursementDetail } from './entities/reimbursement-detail.entity';
import { ReimbursementRepository } from './reimbursement.repository';

@Injectable()
export class ReimbursementService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,

    @InjectRepository(ReimbursementHeader)
    private headerRepository: Repository<ReimbursementHeader>,

    @InjectRepository(ReimbursementDetail)
    private detailRepository: Repository<ReimbursementDetail>,

    private readonly reimbursementRepo: ReimbursementRepository,

    private readonly httpService: HttpService, // Assuming HttpService is used for external API calls
    private readonly dataSource: DataSource,
  ) {}

  async submitReimbursement(dto: CreateReimbursementDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log(
        `Submitting reimbursement with DTO: ${JSON.stringify(dto)}`,
      );
      const header = new ReimbursementHeader();
      Object.assign(header, dto);
      await queryRunner.manager.save(header);

      const mergeDetails = dto.details.map((detail) => ({
        ...detail,
        payor_id: dto.payor_id,
        corporate_id: dto.corporate_id,
        policy_no: dto.policy_no,
        member_id: dto.member_id,
        plan_id: dto.plan_id,
        coverage_type: dto.coverage_type,
      }));

      const payload = {
        endpoint: 'getReimbursement',
        project_id: process.env.ADMEDIKA_PROJECT_ID_MEDICARE || 'test',
        method: 'POST',
        header: { ...dto },
        detail: mergeDetails,
      };

      const response = await this.httpService.axiosRef.post(
        process.env.ADMEDIKA_MEDICARE_URL || 'https://api.admedika.com',
        payload,
        {
          headers: {
            // 'Content-Type': 'application/json',
            'app-id': process.env.ADMEDIKA_APP_ID_MEDICARE || 'default_app_id',
            signature:
              process.env.ADMEDIKA_SIGNATURE_MEDICARE || 'default_signature',
            Authorization: process.env.ADMEDIKA_SIGNATURE_MEDICARE,
          },
        },
      );

      if (response.data.code == 500) {
        await queryRunner.rollbackTransaction();
        return {
          savedId: header.id,
          responseData: response.data ?? null,
          responseStatus: response.status,
          message: response.data.message,
        };
      }

      await queryRunner.commitTransaction();

      this.logger.log(
        `Reimbursement response: ${JSON.stringify(response.data)}`,
      );

      return {
        savedId: header.id,
        responseData: response.data,
        responseStatus: response.status,
        message: 'Success sent request',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error submitting reimbursement', error);
      throw error;
    } finally {
      await queryRunner.release();
      this.logger.log(
        `Reimbursement submission completed for DTO: ${JSON.stringify(dto)}`,
      );
    }
  }

  getReimbursementDetails(): string {
    // get repository

    return 'Reimbursement details fetched successfully!';
  }

  async getReimbursementByClaimRef(claimRef: string) {
    return this.reimbursementRepo.findByClaimRef(claimRef);
  }
}
