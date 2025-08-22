import {
  IsString,
  IsNumber,
  IsDateString,
  IsArray,
  ValidateNested,
  isObject,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ReimbursementDetailDto {
  // @IsString() payor_id: string;
  // @IsString() corporate_id: string;
  // @IsString() policy_no: string;
  // @IsString() member_id: string;
  // @IsString() plan_id: string;
  // @IsString() coverage_type: string;
  @IsString() claim_ref: string;
  @IsString() benefit_code: string;
  @IsString() benefit_desc: string;
  @IsNumber() amount_incurred: number;
  @IsNumber() amount_approved: number;
  @IsNumber() amount_not_approved: number;
  @IsNumber() excess_paid: number;
}

export class CreateReimbursementDto {
  @IsString() payor_id: string;
  @IsString() corporate_id: string;
  @IsString() policy_no: string;
  @IsString() member_id: string;
  @IsString() member_name: string;
  @IsString() member_status: string;
  @IsString() claim_type: string;
  @IsString() claim_process_status: string;
  @IsString() claim_ref: string;
  @IsString() provider_code: string;
  @IsDateString() admission_date: string;
  @IsDateString() discharge_date: string;
  @IsString() duration_days: string;
  @IsString() coverage_type: string;
  @IsString() plan_id: string;
  @IsString() diagnosis_code: string;
  @IsString() diagnosis_desc: string;
  @IsString() reference_no: string;
  @IsString() admedika_claims_id: string;
  @IsString() remarks: string;
  @IsString() disability_no: string;
  @IsNumber() total_amount_incurred: number;
  @IsNumber() total_amount_approved: number;
  @IsNumber() total_amount_not_approved: number;
  @IsNumber() total_excess_paid: number;
  @IsString() approved_date: string;
  @IsString() approved_by: string;
  @IsDateString() received_date: string;
  @IsString() hospital_invoice_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReimbursementDetailDto)
  details: ReimbursementDetailDto[];
}

export class ReimbursementHeaderDto {
  @IsString() payor_id: string;
  @IsString() corporate_id: string;
  @IsString() policy_no: string;
  @IsString() member_id: string;
  @IsString() member_name: string;
  @IsString() member_status: string;
  @IsString() claim_type: string;
  @IsString() claim_process_status: string;
  @IsString() claim_ref: string;
  @IsString() provider_code: string;
  @IsDateString() admission_date: string;
  @IsDateString() discharge_date: string;
  @IsString() duration_days: string;
  @IsString() coverage_type: string;
  @IsString() plan_id: string;
  @IsString() diagnosis_code: string;
  @IsString() diagnosis_desc: string;
  @IsString() reference_no: string;
  @IsString() admedika_claims_id: string;
  @IsString() remarks: string;
  @IsString() disability_no: string;
  @IsNumber() total_amount_incurred: number;
  @IsNumber() total_amount_approved: number;
  @IsNumber() total_amount_not_approved: number;
  @IsNumber() total_excess_paid: number;
  @IsString() approved_date: string;
  @IsString() approved_by: string;
  @IsDateString() received_date: string;
  @IsString() hospital_invoice_id: string;
}
export class BodyRequestReimbursementDto {
  @IsObject()
  header: ReimbursementHeaderDto;

  @IsObject()
  detail: ReimbursementDetailDto[];
}
