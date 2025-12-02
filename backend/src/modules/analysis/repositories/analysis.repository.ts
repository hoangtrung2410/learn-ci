import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeORMRepository } from '../../../database/typeorm.repository';
import { AnalysisEntity } from '../entities/analysis.entity';

@Injectable()
export class AnalysisRepository extends TypeORMRepository<AnalysisEntity> {
  constructor(private dataSource: DataSource) {
    super(AnalysisEntity, dataSource.createEntityManager());
  }
}
