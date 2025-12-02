import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeORMRepository } from '../../../database/typeorm.repository';
import { PipelineEntity } from '../entities/pipeline.entity';

@Injectable()
export class PipelineRepository extends TypeORMRepository<PipelineEntity> {
  constructor(private dataSource: DataSource) {
    super(PipelineEntity, dataSource.createEntityManager());
  }
}
