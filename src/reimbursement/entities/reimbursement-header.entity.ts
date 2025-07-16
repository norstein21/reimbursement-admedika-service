import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ReimbursementDetail } from './reimbursement-detail.entity';

@Entity('reimbursement_header')
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
  @Column() duration_days: number;
  @Column() coverage_type: string;
  @Column() plan_id: string;
  @Column() diagnosis_code: string;
  @Column() total_amount_incurred: number;
  @Column() total_amount_approved: number;
  @Column() total_amount_not_approved: number;
  @Column() total_excess_paid: number;
  @Column() approved_date: string;
  @Column() approved_by: string;
  @Column() received_date: string;
  @Column() hospital_invoice_id: string;

  @OneToMany(() => ReimbursementDetail, (detail) => detail.header, {
    cascade: true,
  })
  details: ReimbursementDetail[];
}
