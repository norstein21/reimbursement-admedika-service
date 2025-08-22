import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReimbursementDetail } from './reimbursement-detail.entity';
import { ReimbursementAttempt } from './reimbursement-attempt.entity';

@Entity('reimbursement_headers')
@Index(
  'UQ_header_key',
  [
    'payor_id',
    'corporate_id',
    'policy_no',
    'member_id',
    'claim_ref',
    'provider_code',
  ],
  { unique: true },
)
export class ReimbursementHeader {
  @PrimaryGeneratedColumn() id: number;
  @Column() payor_id: string;
  @Column() corporate_id: string;
  @Column() policy_no: string;
  @Column() member_id: string;
  @Column() member_name: string;
  @Column() member_status: string;
  @Column() claim_type: string;
  @Column() claim_process_status: string;
  @Column() claim_ref: string;
  @Column() provider_code: string;
  @Column() admission_date: string;
  @Column() discharge_date: string;
  @Column() duration_days: string;
  @Column() coverage_type: string;
  @Column() plan_id: string;
  @Column() diagnosis_code: string;
  @Column() diagnosis_desc: string;
  @Column() total_amount_incurred: number;
  @Column() total_amount_approved: number;
  @Column() total_amount_not_approved: number;
  @Column() total_excess_paid: number;
  @Column() approved_date: string;
  @Column() approved_by: string;
  @Column() received_date: string;
  @Column() hospital_invoice_id: string;
  // reference_no, admedika_claims_id, diagnosis_desc, remarks, disability_no
  @Column() reference_no: string;
  @Column() admedika_claims_id: string;
  // remarks length 1200
  @Column({ length: 1200 }) remarks: string;
  @Column() disability_no: string;

  @Column({ type: 'bit', default: 0 }) request_status: number;
  @Column({ type: 'int', default: 0 }) retry_count: number;
  @Column({ type: 'datetime', nullable: true }) last_attempt_at: Date | null;
  @Column({ type: 'int', nullable: true }) last_attempt_id: number | null;

  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() update_at: Date;

  @OneToMany(() => ReimbursementDetail, (detail) => detail.header, {
    cascade: true,
  })
  details: ReimbursementDetail[];

  @OneToMany(() => ReimbursementAttempt, (attempt) => attempt.header, {
    cascade: true,
  })
  attempts: ReimbursementAttempt[];
}
