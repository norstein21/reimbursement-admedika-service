import { DataSource } from 'typeorm';
import { ReimbursementHeader } from './entities/reimbursement-header.entity';

export const ReimbursementRepository = (dataSource: DataSource) => {
  dataSource.getRepository(ReimbursementHeader).extend({
    async findByClaimRef(claimRef: string) {
      return this.findOne({
        where: { claim_ref: claimRef },
        relations: ['details'],
      });
    },
  });
};
