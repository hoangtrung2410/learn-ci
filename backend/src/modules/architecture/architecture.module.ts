import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  DeploymentArchitectureEntity,
  ArchitectureComponentEntity,
  PipelineTemplateEntity,
  ArchitectureTemplateMapEntity,
} from './entities';

import { DeploymentArchitectureRepository } from './repositories/deployment-architecture.repository';
import { ArchitectureComponentRepository } from './repositories/architecture-component.repository';
import { PipelineTemplateRepository } from './repositories/pipeline-template.repository';
import { ArchitectureTemplateMapRepository } from './repositories/architecture-template-map.repository';

import { ArchitectureService } from './services/architecture.service';
import { ComponentService } from './services/component.service';
import { TemplateService } from './services/template.service';

import { ArchitectureController } from './controllers/architecture.controller';
import { ComponentController } from './controllers/component.controller';
import { TemplateController } from './controllers/template.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeploymentArchitectureEntity,
      ArchitectureComponentEntity,
      PipelineTemplateEntity,
      ArchitectureTemplateMapEntity,
    ]),
  ],
  providers: [
    DeploymentArchitectureRepository,
    ArchitectureComponentRepository,
    PipelineTemplateRepository,
    ArchitectureTemplateMapRepository,
    ArchitectureService,
    ComponentService,
    TemplateService,
  ],
  controllers: [
    ArchitectureController,
    ComponentController,
    TemplateController,
  ],
  exports: [
    ArchitectureService,
    ComponentService,
    TemplateService,
    DeploymentArchitectureRepository,
    ArchitectureComponentRepository,
    PipelineTemplateRepository,
    ArchitectureTemplateMapRepository,
  ],
})
export class ArchitectureModule {}
