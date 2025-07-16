import { Injectable, LoggerService, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { ReimbursementHeader } from './entities/reimbursement-header.entity';
import { CreateReimbursementDto } from './dto/create-reimbursement.dto';
import { Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class ReimbursementService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    @InjectRepository(ReimbursementHeader)
    private headerRepository: Repository<ReimbursementHeader>,
    private readonly httpService: HttpService, // Assuming HttpService is used for external API calls
  ) {}

  async submitReimbursement(dto: CreateReimbursementDto) {
    this.logger.log(
      `Submitting reimbursement with DTO: ${JSON.stringify(dto)}`,
    );
    const saved = await this.headerRepository.save(dto);
    this.logger.log(`Reimbursement submitted with ID: ${saved.id}`);

    // const response = await this.httpService.axiosRef.post(
    //   process.env.ADMEDIKA_API_URL || 'https://api.admedika.com',
    //   {
    //     endpoint: 'submitReimbursement',
    //     method: 'POST',
    //     projectId: process.env.ADMEDIKA_PROJECT_ID || 'default_project_id',
    //     header: { ...dto },
    //     dto: dto.details,
    //   },
    //   {
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization: `Bearer ${process.env.ADMEDIKA_API_KEY || 'your_api_key'}`,
    //     },
    //   },
    // );

    // return {
    //   savedId: saved.id,
    //   responseData: response.data,
    // };

    return {
      savedId: saved.id,
      responseData: 'Reimbursement submitted successfully!',
    };
  }

  getReimbursementDetails(): string {
    return 'Reimbursement details fetched successfully!';
  }
}
