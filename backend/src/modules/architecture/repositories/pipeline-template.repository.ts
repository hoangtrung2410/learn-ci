import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeORMRepository } from '../../../database/typeorm.repository';
import { PipelineTemplateEntity } from '../entities/pipeline-template.entity';

@Injectable()
export class PipelineTemplateRepository extends TypeORMRepository<PipelineTemplateEntity> {
  constructor(private dataSource: DataSource) {
    super(PipelineTemplateEntity, dataSource.createEntityManager());
  }
}
