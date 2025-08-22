import { Type, Transform } from 'class-transformer';
import {
  IsArray,
  IsString,
  IsOptional,
  IsNotEmpty,
  ValidateNested,
  IsNumber,
  IsDateString,
  Length,
  MaxLength,
  Matches,
  Min,
  IsInt,
} from 'class-validator';

const UpperTrim = () =>
  Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  );
const DEC182 = /^\d{1,16}(\.\d{1,2})?$/; // DECIMAL(18,2)

export class ReimbursementMCDetailDto {
  @IsString() @IsNotEmpty() @Length(1, 50) @UpperTrim() KD_ITEM: string;
  @IsOptional() @IsString() @Length(0, 120) NM_ITEM: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  TTL_CLAIM: number;
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  TTL_PAID: number;
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  TTL_EXCESS: number;
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  EXCESS_PAID: number;
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  EXCESS_NOT_PAID: number;

  @IsString() @IsNotEmpty() @MaxLength(200) KET_EXCESS: string;
}

export class CreateReimbursementMCDto {
  @IsString() @IsNotEmpty() @Length(1, 8) @UpperTrim() KD_HOLDING: string;
  @IsString() @IsNotEmpty() @Length(1, 50) @UpperTrim() KD_CUS_CLIENT: string;
  @IsString() @IsNotEmpty() @Length(1, 35) @UpperTrim() NO_POLIS: string;
  @IsString() @IsNotEmpty() @Length(1, 70) @UpperTrim() INSURANCE_NO: string;
  @IsString() @IsNotEmpty() @Length(1, 60) MEMBER_NAME: string;
  @IsString() @IsNotEmpty() @Length(1, 1) @UpperTrim() STA_MEMBER: string;
  @IsString() @IsNotEmpty() @Length(1, 1) @UpperTrim() CLAIM_TYPE: string;
  @IsString()
  @IsNotEmpty()
  @Length(1, 1)
  @UpperTrim()
  CLAIM_PROC_STATUS: string;
  @IsString() @IsNotEmpty() @Length(1, 25) @UpperTrim() CLAIM_NO_PAYOR: string;

  @IsOptional() @IsString() @Length(0, 16) @UpperTrim() CLAIM_NO?: string;
  @IsOptional() @IsString() @Length(0, 2) @UpperTrim() REFF_NO?: string;

  @IsString() @IsNotEmpty() @Length(1, 15) @UpperTrim() PROVIDER_CODE: string;
  @IsString() @IsNotEmpty() @Length(1, 70) PROVIDER_NAME: string;

  @IsDateString({}, { message: 'INDATE must be YYYY-MM-DD' }) INDATE: string;
  @IsDateString({}, { message: 'OUTDATE must be YYYY-MM-DD' }) OUTDATE: string;

  @Type(() => Number) @IsInt() @Min(0) DURATION_DAYS: number;
  @IsString() @IsNotEmpty() @Length(1, 5) @UpperTrim() KD_PLAN: string;
  @IsString() @IsNotEmpty() @Length(1, 8) @UpperTrim() KD_PLAN_DTL: string;

  @IsString() @IsNotEmpty() @Length(1, 10) @UpperTrim() KD_ICD: string;
  @IsOptional() @IsString() @MaxLength(255) DIAGNOSIS_DESC?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  TTL_CLAIM: number;
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  TTL_PAID: number;
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  TTL_EXCESS: number;
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  EXCESS_PAID: number;

  @IsOptional() @IsString() @MaxLength(2000) KETERANGAN?: string;
  @IsOptional() @IsString() @MaxLength(30) @UpperTrim() DISABILITY_NO?: string;

  @IsOptional()
  @IsDateString({}, { message: 'CREATEDDATE must be YYYY-MM-DD' })
  CREATEDDATE?: string;
  @IsString() @IsNotEmpty() @Length(1, 35) USER_NM: string;
  @IsDateString({}, { message: 'RCV_DATE must be YYYY-MM-DD' })
  RCV_DATE: string;
  @IsString() @IsNotEmpty() @Length(1, 30) HOSPITAL_INVOICE_ID: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReimbursementMCDetailDto)
  CLAIM_DETAIL_LIST: ReimbursementMCDetailDto[];
}
