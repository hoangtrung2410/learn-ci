import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TypeORMRepository } from '../../../database/typeorm.repository';
import { ProjectEntity } from '../entities/project.entity';

export class ProjectRepository extends TypeORMRepository<ProjectEntity> {
  constructor(
    @InjectRepository(ProjectEntity)
    repository: Repository<ProjectEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }
}
