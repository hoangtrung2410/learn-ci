import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TypeORMRepository } from '../../../database';
import { RoleEntity } from '../entities';
import { UserEntity } from '../../user/entities/user.entity';

export class RoleRepository extends TypeORMRepository<RoleEntity> {
  constructor(
    @InjectRepository(RoleEntity)
    repository: Repository<RoleEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }
  async getUserMatchPermission(userId: string, permissionCodes: string[]) {
    const rawResults = await this.createQueryBuilder()
      .select(['usr.id', 'ro.id'])
      .from(RoleEntity, 'ro')
      .innerJoin(UserEntity, 'usr', 'ro.id = usr.role')
      .where('usr.id = :userId', { userId })
      .leftJoin('ro.permissions', 'pms')
      .addSelect(['pms.code'])
      .andWhere('pms.code IN(:...permissionCodes)', { permissionCodes })
      .getRawMany();
    console.log(rawResults);

    return rawResults.map((rawResult) => rawResult?.pms_code);
  }
}
