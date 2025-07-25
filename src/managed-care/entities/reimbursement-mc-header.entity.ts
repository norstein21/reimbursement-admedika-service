// reimbursement-mc-header.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { ReimbursementMCDetail } from './reimbursement-mc-detail.entity';

@Entity('reimbursement_mc_headers')
export class ReimbursementMCHeader {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 8 })
  KD_HOLDING: string;

  @Column({ length: 50 })
  KD_CUS_CLIENT: string;

  @Column({ length: 35 })
  NO_POLIS: string;

  @Column({ length: 16 })
  INSURANCE_NO: string;

  @Column({ length: 60 })
  MEMBER_NAME: string;

  @Column({ length: 1 })
  STA_MEMBER: string;

  @Column({ length: 1 })
  CLAIM_TYPE: string;

  @Column({ length: 1 })
  CLAIM_PROC_STATUS: string;

  @Column({ length: 25 })
  CLAIM_NO_PAYOR: string;

  @Column({ length: 16, nullable: true })
  CLAIM_NO?: string;

  @Column({ length: 2, nullable: true })
  REFF_NO?: string;

  @Column({ length: 15 })
  PROVIDER_CODE: string;

  @Column({ length: 70 })
  RS: string;

  @Column({ type: 'date' })
  INDATE: string;

  @Column({ type: 'date' })
  OUTDATE: string;

  @Column({ type: 'int' })
  DURATION_DAYS: number;

  @Column({ length: 5 })
  KD_PLAN: string;

  @Column({ length: 8 })
  KD_PLAN_DTL: string;

  @Column({ length: 10 })
  KDICD1: string;

  @Column({ length: 255, nullable: true })
  DIAGNOSIS_DESC?: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  TTL_CLAIM: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  TTL_PAID: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  TTL_EXCESS: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  EXCESS_PAID: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  EXCESS_NOT_PAID: number;

  @Column({ length: 2000, nullable: true })
  KETERANGAN?: string;

  @Column({ length: 30, nullable: true })
  DISABILITY_NO?: string;

  @Column({ type: 'date' })
  CREATEDDATE: string;

  @Column({ length: 35 })
  USER_NM: string;

  @Column({ type: 'date' })
  RECEIVED_DATE: string;

  @Column({ length: 30 })
  HOSPITAL_INVOICE_ID: string;

  @OneToMany(() => ReimbursementMCDetail, (detail) => detail.header, {
    cascade: true,
  })
  CLAIM_DETAIL_LIST: ReimbursementMCDetail[];

  @BeforeInsert()
  setCreatedDate() {
    this.CREATEDDATE = new Date().toISOString().split('T')[0];
  }
}
