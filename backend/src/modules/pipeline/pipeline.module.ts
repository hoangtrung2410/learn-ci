import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PipelineEntity } from './entities/pipeline.entity';
import { PipelineLogEntity } from './entities/pipeline-log.entity';
import { PipelineController } from './pipeline.controller';
import { MetricsController } from './metrics.controller';
import { WebhookController } from './webhook.controller';
import { PipelineService } from './pipeline.service';
import { MetricsService } from './services/metrics.service';
import { PipelineRepository } from './repositories/pipeline.repository';
import { PipelineLogRepository } from './repositories/pipeline-log.repository';
import { PipelineFactoryHelper } from './helpers/pipeline-factory.helper';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PipelineEntity, PipelineLogEntity]),
    ProjectsModule,
  ],
  controllers: [PipelineController, MetricsController, WebhookController],
  providers: [
    PipelineService,
    MetricsService,
    PipelineRepository,
    PipelineLogRepository,
    PipelineFactoryHelper,
  ],
  exports: [
    PipelineService,
    MetricsService,
    PipelineRepository,
    PipelineLogRepository,
    PipelineFactoryHelper,
  ],
})
export class PipelineModule { }
