import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { ReimbursementMCService } from './reimbursement-mc.service';
import { CreateReimbursementMCDto } from './dto/create-reimbursement-mc.dto';
import { Response } from 'express';

@Controller('reimbursement-mc')
export class ReimbursementMCController {
  constructor(
    private readonly reimbursementMCService: ReimbursementMCService,
  ) {}

  @Post()
  async submitMCClaim(
    @Body() data: CreateReimbursementMCDto,
    @Res() res: Response,
  ) {
    try {
      const { savedId, responseData, responseStatus, message } =
        await this.reimbursementMCService.submitMCClaim(data);

      return res.status(responseStatus).json({
        savedId,
        responseData,
        message,
      });
    } catch (error) {
      throw error;
    }
  }

  // test
  @Get('test')
  async testEndpoint() {
    return { message: 'Reimbursement MC service is working!' };
  }
}
