import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ReimbursementHeader } from './reimbursement-header.entity';

@Entity('reimbursement_details')
export class ReimbursementDetail {
  @PrimaryGeneratedColumn() id: number;
  @ManyToOne(() => ReimbursementHeader, (header) => header.details)
  header: ReimbursementHeader;

  @Column() payor_id: string;
  @Column() corporate_id: string;
  @Column() policy_no: string;
  @Column() member_id: string;
  @Column() plan_id: string;
  @Column() coverage_type: string;
  @Column() claim_ref: string;
  @Column() benefit_code: string;
  @Column() benefit_desc: string;
  @Column() amount_incurred: number;
  @Column() amount_approved: number;
  @Column() amount_not_approved: number;
  @Column() excess_paid: number;
  // @Column() created_at: Date;
  // @Column() updated_at: Date;
  // @Column() deleted_at: Date;
  // @Column({ default: false }) is_deleted: boolean;
}
