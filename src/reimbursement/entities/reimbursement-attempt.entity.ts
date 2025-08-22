import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ReimbursementHeader } from './reimbursement-header.entity';

export enum AttemptStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Entity('reimbursement_attempts')
export class ReimbursementAttempt {
  @PrimaryGeneratedColumn() id: number;

  @ManyToOne(() => ReimbursementHeader, (header) => header.attempts)
  @JoinColumn({ name: 'header_id' })
  header: ReimbursementHeader;

  @Column({ type: 'varchar', length: 20 })
  status: AttemptStatus;

  @Column({ type: 'int', nullable: true })
  http_status: number | null;

  @Column({ type: 'nvarchar', length: 4000, nullable: true })
  error_message: string | null;

  @Column({ type: 'nvarchar', length: 4000, nullable: true })
  request_snapshot: string | null;

  @Column({ type: 'nvarchar', length: 4000, nullable: true })
  response_snapshot: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  trace_id: string | null;

  @Column({ type: 'int', nullable: true })
  latency_ms: number | null;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'datetime', nullable: true })
  finished_at: Date | null;
}
