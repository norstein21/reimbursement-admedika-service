// reimbursement-mc-detail.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReimbursementMCHeader } from './reimbursement-mc-header.entity';
import { Type } from 'class-transformer';

@Entity('reimbursement_mc_details')
export class ReimbursementMCDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ReimbursementMCHeader, (header) => header.CLAIM_DETAIL_LIST)
  @JoinColumn({ name: 'header_id' })
  @Type(() => ReimbursementMCHeader)
  header: ReimbursementMCHeader;

  @Column({ length: 50 })
  KD_ITEM: string;

  @Column({ length: 120, nullable: true })
  NM_ITEM?: string;

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

  @Column({ length: 200 })
  KET_EXCESS: string;

  @CreateDateColumn()
  CREATEDDATE: Date;

  @UpdateDateColumn()
  UPDATEDDATE: Date;
}
