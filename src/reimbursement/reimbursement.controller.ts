import { Body, Controller, Get, Post } from '@nestjs/common';
import { ReimbursementService } from './reimbursement.service';
import { CreateReimbursementDto } from './dto/create-reimbursement.dto';

@Controller('reimbursement')
export class ReimbursementController {
  constructor(private readonly reimbursementService: ReimbursementService) {}

  // TODO: tambahin detailsnya
  @Post()
  async createReimbursement(
    @Body('header') dto: CreateReimbursementDto,
    @Body('details') details: any,
  ) {
    const reimbursementDto = { ...dto, details };
    return this.reimbursementService.submitReimbursement(reimbursementDto);
  }

  @Get('details')
  getReimbursementDetails() {
    return this.reimbursementService.getReimbursementDetails();
  }
}
