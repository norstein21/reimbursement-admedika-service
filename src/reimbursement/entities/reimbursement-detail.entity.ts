import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ReimbursementHeader } from './reimbursement-header.entity';

@Entity('reimbursement_details')
export class ReimbursementDetail {
  @PrimaryGeneratedColumn() id: number;
  @ManyToOne(() => ReimbursementHeader, (header) => header.details)
  header: ReimbursementHeader;

  @Column() claim_ref: string;
  @Column() benefit_code: string;
  @Column() benefit_desc: string;
  @Column() amount_incurred: number;
  @Column() amount_approved: number;
  @Column() amount_not_approved: number;
  @Column() excess_paid: number;
}
