import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { ReimbursementService } from './reimbursement.service';
import {
  CreateReimbursementDto,
  ReimbursementDetailDto,
} from './dto/create-reimbursement.dto';
import { Response } from 'express';

@Controller('reimbursement')
export class ReimbursementController {
  constructor(private readonly reimbursementService: ReimbursementService) {}

  // TODO: tambahin detailsnya
  @Post()
  async createReimbursement(
    @Body('header') dto: CreateReimbursementDto,
    @Body('detail') details: ReimbursementDetailDto[],
    @Res() res: Response,
  ) {
    try {
      const reimbursementDto = { ...dto, details };
      const { savedId, responseData, responseStatus, message } =
        await this.reimbursementService.submitReimbursement(reimbursementDto);

      return res.status(responseStatus).json({
        savedId,
        responseData,
        message,
      });
    } catch (error) {
      throw error;
    }
  }

  @Get('details')
  getReimbursementDetails() {
    return this.reimbursementService.getReimbursementDetails();
  }
}
