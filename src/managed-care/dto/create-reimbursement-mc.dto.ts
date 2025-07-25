import { Type } from 'class-transformer';
import {
  IsArray,
  IsString,
  IsOptional,
  IsNotEmpty,
  ValidateNested,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class ReimbursementMCDetailDto {
  @IsString() KD_ITEM: string;
  @IsString() NM_ITEM: string;

  @IsNumber() TTL_CLAIM: number;
  @IsNumber() TTL_PAID: number;
  @IsNumber() TTL_EXCESS: number;
  @IsNumber() EXCESS_PAID: number;
  @IsNumber() EXCESS_NOT_PAID: number;

  @IsString() KET_EXCESS: string;
}

export class CreateReimbursementMCDto {
  @IsString() KD_HOLDING: string;
  @IsString() KD_CUS_CLIENT: string;
  @IsString() NO_POLIS: string;
  @IsString() INSURANCE_NO: string;
  @IsString() MEMBER_NAME: string;
  @IsString() STA_MEMBER: string;
  @IsString() CLAIM_TYPE: string;
  @IsString() CLAIM_PROC_STATUS: string;
  @IsString() CLAIM_NO_PAYOR: string;
  @IsOptional() @IsString() CLAIM_NO?: string;
  @IsOptional() @IsString() REFF_NO?: string;
  @IsString() PROVIDER_CODE: string;
  @IsString() RS: string;

  @IsDateString() INDATE: string;
  @IsDateString() OUTDATE: string;

  @IsNumber() DURATION_DAYS: number;
  @IsString() KD_PLAN: string;
  @IsString() KD_PLAN_DTL: string;

  @IsString() KDICD1: string;
  @IsOptional() @IsString() DIAGNOSIS_DESC?: string;

  @IsNumber() TTL_CLAIM: number;
  @IsNumber() TTL_PAID: number;
  @IsNumber() TTL_EXCESS: number;
  @IsNumber() EXCESS_PAID: number;
  @IsNumber() EXCESS_NOT_PAID: number;

  @IsOptional() @IsString() KETERANGAN?: string;
  @IsOptional() @IsString() DISABILITY_NO?: string;

  @IsDateString() CREATEDDATE: string;
  @IsString() USER_NM: string;
  @IsDateString() RECEIVED_DATE: string;
  @IsString() HOSPITAL_INVOICE_ID: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReimbursementMCDetailDto)
  CLAIM_DETAIL_LIST: ReimbursementMCDetailDto[];
}
