import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeORMRepository } from '../../../database/typeorm.repository';
import { DeploymentArchitectureEntity } from '../entities/deployment-architecture.entity';

@Injectable()
export class DeploymentArchitectureRepository extends TypeORMRepository<DeploymentArchitectureEntity> {
  constructor(private dataSource: DataSource) {
    super(DeploymentArchitectureEntity, dataSource.createEntityManager());
  }
}
