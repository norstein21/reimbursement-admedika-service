import { DataSource, Repository } from 'typeorm';
import { ReimbursementHeader } from './entities/reimbursement-header.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ReimbursementRepository extends Repository<ReimbursementHeader> {
  constructor(private readonly dataSource: DataSource) {
    super(ReimbursementHeader, dataSource.createEntityManager());
  }

  async findByClaimRef(claimRef: string) {
    return this.findOne({
      where: { claim_ref: claimRef },
      relations: ['details'],
    });
  }
}
