import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PipelineEntity } from './entities/pipeline.entity';
import { PipelineController } from './pipeline.controller';
import { MetricsController } from './metrics.controller';
import { WebhookController } from './webhook.controller';
import { PipelineService } from './pipeline.service';
import { MetricsService } from './services/metrics.service';
import { PipelineRepository } from './repositories/pipeline.repository';
import { PipelineFactoryHelper } from './helpers/pipeline-factory.helper';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [TypeOrmModule.forFeature([PipelineEntity]), ProjectsModule],
  controllers: [PipelineController, MetricsController, WebhookController],
  providers: [
    PipelineService,
    MetricsService,
    PipelineRepository,
    PipelineFactoryHelper,
  ],
  exports: [
    PipelineService,
    MetricsService,
    PipelineRepository,
    PipelineFactoryHelper,
  ],
})
export class PipelineModule {}
