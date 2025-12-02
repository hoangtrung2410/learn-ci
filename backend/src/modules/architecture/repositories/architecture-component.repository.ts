import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeORMRepository } from '../../../database/typeorm.repository';
import { ArchitectureComponentEntity } from '../entities/architecture-component.entity';

@Injectable()
export class ArchitectureComponentRepository extends TypeORMRepository<ArchitectureComponentEntity> {
  constructor(private dataSource: DataSource) {
    super(ArchitectureComponentEntity, dataSource.createEntityManager());
  }
}
