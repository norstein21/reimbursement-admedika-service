import {
  Injectable,
  // LoggerService,
  // Inject,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { ReimbursementHeader } from './entities/reimbursement-header.entity';
import { CreateReimbursementDto } from './dto/create-reimbursement.dto';
import { DataSource, Repository } from 'typeorm';
// import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ReimbursementDetail } from './entities/reimbursement-detail.entity';
import { ReimbursementRepository } from './reimbursement.repository';
import {
  AttemptStatus,
  ReimbursementAttempt,
} from './entities/reimbursement-attempt.entity';
import { getTraceId } from 'src/logger/request-context';

@Injectable()
export class ReimbursementService {
  constructor(
    // @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,

    @InjectRepository(ReimbursementHeader)
    private headerRepository: Repository<ReimbursementHeader>,

    @InjectRepository(ReimbursementDetail)
    private detailRepository: Repository<ReimbursementDetail>,

    private readonly reimbursementRepo: ReimbursementRepository,

    private readonly httpService: HttpService, // Assuming HttpService is used for external API calls
    private readonly dataSource: DataSource,
  ) {}

  private toRequestStatus(responseBody: any): 0 | 1 {
    console.log(responseBody);
    return responseBody?.code > 200 ||
      String(responseBody?.data?.message_desc || '').includes('ERROR')
      ? 0
      : 1;
  }

  async submitReimbursement(dto: CreateReimbursementDto) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    const start = Date.now();
    let attemptId: number | undefined;
    try {
      const header = new ReimbursementHeader();
      Object.assign(header, dto);
      await qr.manager.save(header);

      // 3) Create PENDING attempt
      const payload = this.buildPayload(dto);
      const attempt = qr.manager.create(ReimbursementAttempt, {
        header_id: header.id,
        status: AttemptStatus.PENDING, // <-- store as varchar in SQL Server 2014
        http_status: null,
        error_message: null,
        request_snapshot: JSON.stringify({
          endpoint: payload.endpoint,
          header: payload.header,
          detailLen: payload.detail?.length,
        }).slice(0, 3999),
        response_snapshot: null,
        trace_id: getTraceId?.() || null,
        latency_ms: null,
        finished_at: null,
      });
      await qr.manager.save(attempt);
      attemptId = attempt.id;

      // 4) Call upstream (outside of DB operations)
      let responseStatus = 0;
      let responseBody: any = null;
      try {
        const res = await this.httpService.axiosRef.post(
          process.env.ADMEDIKA_MEDICARE_URL || 'https://api.admedika.com',
          payload,
          {
            headers: {
              'app-id':
                process.env.ADMEDIKA_APP_ID_MEDICARE || 'default_app_id',
              signature:
                process.env.ADMEDIKA_SIGNATURE_MEDICARE || 'default_signature',
              Authorization: process.env.ADMEDIKA_SIGNATURE_MEDICARE,
            },
          },
        );
        responseStatus = res.status;
        responseBody = res.data;
      } catch (e: any) {
        responseStatus = e?.response?.status ?? 0;
        responseBody = e?.response?.data ?? {
          message: e?.message || 'Upstream error',
        };
      }

      // 5) Finalize attempt + header summary
      const latency = Date.now() - start;
      const requestStatus = this.toRequestStatus(responseBody);

      attempt.status =
        requestStatus === 1 ? AttemptStatus.SUCCESS : AttemptStatus.FAILED;
      attempt.http_status = responseStatus || null;
      attempt.response_snapshot =
        JSON.stringify(responseBody)?.slice(0, 3999) || null;
      attempt.latency_ms = latency;
      attempt.finished_at = new Date();
      await qr.manager.save(attempt);

      header.request_status = requestStatus;
      header.retry_count = (header.retry_count || 0) + 1;
      (header as any).last_attempt_id = attempt.id; // ensure these columns exist on header
      (header as any).last_attempt_at = new Date();
      await qr.manager.save(header);

      await qr.commitTransaction();

      this.logger.log(
        `submitReimbursement header=${header.id} attempt=${attempt.id} status=${attempt.status}`,
      );

      return {
        savedId: header.id,
        attemptId: attempt.id,
        requestStatus,
        responseStatus,
        responseData: responseBody,
        message:
          requestStatus === 1
            ? 'Submitted & upstream success'
            : 'Submitted but upstream failed',
      };
    } catch (err) {
      await qr.rollbackTransaction();

      const driverErrNum = err?.number ?? err?.code;
      if (driverErrNum === 2627 || driverErrNum === 2601) {
        const existing = await qr.manager.findOne(ReimbursementHeader, {
          where: {
            payor_id: dto.payor_id,
            corporate_id: dto.corporate_id,
            policy_no: dto.policy_no,
            member_id: dto.member_id,
            claim_ref: dto.claim_ref,
            provider_code: dto.provider_code,
          },
        });
        if (existing) {
          this.logger.warn(
            `Reimbursement header with this data already exists in headerId = ${existing.id} `,
          );
          throw new ConflictException(
            `(DUPLICATE)Reimbursement header already exists in headerId = ${existing.id} `,
          );
        }
      }
      this.logger.error('Error submitReimbursement', err as any);
      throw new BadRequestException('Failed to submit reimbursement.');
    } finally {
      await qr.release();
    }
  }

  async reinvokeByHeaderId(headerId: number) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    const start = Date.now();

    try {
      const header = await qr.manager.findOne(ReimbursementHeader, {
        where: { id: headerId },
        lock: { mode: 'pessimistic_write' },
        relations: ['details'],
      });

      if (!header)
        throw new NotFoundException(`Header with ID ${headerId} not found`);

      if (header.request_status === 1) {
        throw new ConflictException(`Header ${headerId} is already processed`);
      }

      const dataDtoFormat: CreateReimbursementDto = this.toCreateDto(
        header,
        header.details,
      );

      const payload = this.buildPayload(dataDtoFormat);

      const requestSnapshot = JSON.stringify({
        endpoint: payload.endpoint,
        header: payload.header,
        detail: payload.detail,
        detailLength: payload.detail?.length,
      });

      const attempt = qr.manager.create(ReimbursementAttempt, {
        header_id: header.id,
        status: AttemptStatus.PENDING,
        http_status: null,
        error_message: null,
        request_snapshot: requestSnapshot.slice(0, 3999),
        response_snapshot: null,
        trace_id: getTraceId(),
        latency_ms: null,
        finished_at: null,
      });

      await qr.manager.save(attempt);

      let responseStatus = 0;
      let responseBody: any = null;

      try {
        const res = await this.httpService.axiosRef.post(
          process.env.ADMEDIKA_MEDICARE_URL || 'https://api.admedika.com',
          payload,
          {
            headers: {
              'app-id':
                process.env.ADMEDIKA_APP_ID_MEDICARE || 'default_app_id',
              signature:
                process.env.ADMEDIKA_SIGNATURE_MEDICARE || 'default_signature',
              Authorization: process.env.ADMEDIKA_SIGNATURE_MEDICARE,
            },
          },
        );

        console.log('payload', payload);
        responseStatus = res.status;
        console.log('resBody:', res.data);
        console.log('resHeader', res.headers);
        responseBody = res.data;
      } catch (e) {
        responseStatus = e?.response?.status ?? 0;
        responseBody = e?.response?.data ?? {
          message: e?.message || 'Upstream error',
        };
      }

      console.log('responseStatus:', responseStatus);

      console.log('responseBody:', responseBody);
      const resStatus =
        responseBody?.code > 200 ||
        String(responseBody?.data?.message_desc || '').includes('ERROR')
          ? 0
          : 1;

      console.log('resStatus:', resStatus);

      const latency = Date.now() - start;

      attempt.status =
        resStatus === 1 ? AttemptStatus.SUCCESS : AttemptStatus.FAILED;
      attempt.http_status = responseStatus || null;
      attempt.response_snapshot =
        JSON.stringify(responseBody)?.slice(0, 3999) || null;
      attempt.latency_ms = latency;
      attempt.finished_at = new Date();
      await qr.manager.save(attempt);

      header.request_status = responseStatus;
      header.retry_count = (header.retry_count || 0) + 1;
      header.last_attempt_at = new Date();
      header.last_attempt_id = attempt.id;
      await qr.manager.save(header);

      await qr.commitTransaction();

      this.logger.log(
        `Reinvoke headerId=${headerId} attemptId=${attempt.id} status=${attempt.status}`,
      );

      return {
        headerId,
        attemptId: attempt.id,
        resStatus,
        responseStatus,
        responseData: responseBody,
        message:
          resStatus === 1
            ? 'Reinvoke succeeded'
            : 'Reinvoke finished but failed',
      };
    } catch (error) {
      await qr.rollbackTransaction();
      this.logger.error(`Reinvoke error header=${headerId}`, error as any);
      throw new BadRequestException('Failed to reinvoke. See logs for details');
    } finally {
      await qr.release();
    }
  }

  getReimbursementDetails(): string {
    // get repository

    return 'Reimbursement details fetched successfully!';
  }

  async getReimbursementByClaimRef(claimRef: string) {
    return this.reimbursementRepo.findByClaimRef(claimRef);
  }

  async listFailed(limit = 50) {
    return this.headerRepository.find({
      where: { request_status: 0 },
      order: { last_attempt_at: 'DESC', id: 'DESC' },
      take: limit,
      relations: ['details'],
    });
  }

  getReimbursementByRequestStatus(requestStatus: number) {
    return this.reimbursementRepo.findByRequestStatus(requestStatus);
  }

  toCreateDto(
    header: ReimbursementHeader,
    details: ReimbursementDetail[],
  ): CreateReimbursementDto {
    return {
      payor_id: header.payor_id,
      corporate_id: header.corporate_id,
      policy_no: header.policy_no,
      member_id: header.member_id,
      plan_id: header.plan_id,
      coverage_type: header.coverage_type,
      claim_ref: header.claim_ref,
      member_name: header.member_name,
      member_status: header.member_status,
      claim_type: header.claim_type,
      claim_process_status: header.claim_process_status,
      provider_code: header.provider_code,
      admission_date: header.admission_date,
      discharge_date: header.discharge_date,
      duration_days: header.duration_days,
      diagnosis_code: header.diagnosis_code,
      diagnosis_desc: header.diagnosis_desc,
      reference_no: header.reference_no,
      admedika_claims_id: header.admedika_claims_id,
      remarks: header.remarks,
      disability_no: header.disability_no,
      total_amount_incurred: header.total_amount_incurred,
      total_amount_approved: header.total_amount_approved,
      total_amount_not_approved: header.total_amount_not_approved,
      total_excess_paid: header.total_excess_paid,
      approved_date: header.approved_date,
      approved_by: header.approved_by,
      received_date: header.received_date,
      hospital_invoice_id: header.hospital_invoice_id,
      details: details.map((d) => ({
        benefit_code: d.benefit_code,
        benefit_desc: d.benefit_desc,
        amount_incurred: d.amount_incurred,
        amount_approved: d.amount_approved,
        amount_not_approved: d.amount_not_approved,
        excess_paid: d.excess_paid,
        claim_ref: header.claim_ref,
        // add the rest only if ReimbursementDetailDto actually requires them
        payor_id: header.payor_id,
        corporate_id: header.corporate_id,
        policy_no: header.policy_no,
        member_id: header.member_id,
        plan_id: header.plan_id,
        coverage_type: header.coverage_type,
      })),
    };
  }

  private buildPayload(dto: CreateReimbursementDto) {
    const mergeDetails = dto.details.map((detail) => ({
      ...detail,
      payor_id: dto.payor_id,
      corporate_id: dto.corporate_id,
      policy_no: dto.policy_no,
      member_id: dto.member_id,
      plan_id: dto.plan_id,
      coverage_type: dto.coverage_type,
      claim_ref: dto.claim_ref,
    }));

    return {
      endpoint: 'getReimbursement',
      project_id: process.env.ADMEDIKA_PROJECT_ID_MEDICARE || 'test',
      method: 'POST',
      header: { ...dto },
      detail: mergeDetails,
    };
  }
}
