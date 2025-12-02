import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisEntity } from './entities/analysis.entity';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { AnalysisRepository } from './repositories/analysis.repository';
import { PipelineModule } from '../pipeline/pipeline.module';

@Module({
  imports: [TypeOrmModule.forFeature([AnalysisEntity]), PipelineModule],
  controllers: [AnalysisController],
  providers: [AnalysisService, AnalysisRepository],
  exports: [AnalysisService, AnalysisRepository],
})
export class AnalysisModule {}
