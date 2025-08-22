import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Res,
} from '@nestjs/common';
import { ReimbursementService } from './reimbursement.service';
import {
  BodyRequestReimbursementDto,
  CreateReimbursementDto,
  ReimbursementDetailDto,
} from './dto/create-reimbursement.dto';
import { Response } from 'express';
import { getTraceId } from 'src/logger/request-context';

@Controller('reimbursement')
export class ReimbursementController {
  constructor(private readonly reimbursementService: ReimbursementService) {}

  // TODO: tambahin detailsnya
  @Post()
  async createReimbursement(
    @Body() dto: BodyRequestReimbursementDto,
    @Res() res: Response,
  ) {
    try {
      const reimbursementDto = { ...dto.header, details: dto.detail };
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

  @Get(':claimRef')
  async getClaimRef(@Param('claimRef') claimRef: string) {
    return this.reimbursementService.getReimbursementByClaimRef(claimRef);
  }

  // listfailed
  @Post(':limit/list-failed')
  async listFailedReimbursements(
    @Param('limit', ParseIntPipe) limit: number,
    @Res() res: Response,
  ) {
    try {
      const data = await this.reimbursementService.listFailed(limit);
      return res.status(200).json({
        code: 200,
        traceId: getTraceId(),
        success: true,
        message: 'Success get failed reimbursements',
        data,
      });
    } catch (error) {
      throw error;
    }
  }

  @Get('status/:requestStatus')
  async getStatus(
    @Param('requestStatus') requestStatus: number,
    @Res() res: Response,
  ) {
    try {
      const data =
        await this.reimbursementService.getReimbursementByRequestStatus(
          requestStatus,
        );

      return res.status(200).json({
        code: 200,
        traceId: getTraceId(),
        success: true,
        message: 'Success get data by request status',
        data: data[0],
        totalData: data[1],
      });
    } catch (error) {
      throw error;
    }
  }

  // reinvoke BY HEADER ID
  @Post(':id/reinvoke')
  async reinvokeReimbursement(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    try {
      const { responseData, responseStatus, message } =
        await this.reimbursementService.reinvokeByHeaderId(id);

      return res.status(responseStatus).json({
        responseData,
        message,
      });
    } catch (error) {
      throw error;
    }
  }
}
