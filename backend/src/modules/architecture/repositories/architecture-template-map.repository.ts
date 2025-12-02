import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeORMRepository } from '../../../database/typeorm.repository';
import { ArchitectureTemplateMapEntity } from '../entities/architecture-template-map.entity';

@Injectable()
export class ArchitectureTemplateMapRepository extends TypeORMRepository<ArchitectureTemplateMapEntity> {
  constructor(private dataSource: DataSource) {
    super(ArchitectureTemplateMapEntity, dataSource.createEntityManager());
  }
}
