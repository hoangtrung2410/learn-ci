import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TypeORMRepository } from '../../../database';
import { TokenEntity } from '../entities/token.entity';

export class TokenRepository extends TypeORMRepository<TokenEntity> {
  constructor(
    @InjectRepository(TokenEntity)
    repository: Repository<TokenEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }
}
