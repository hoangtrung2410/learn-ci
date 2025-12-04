import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DeploymentArchitectureEntity,
} from './entities';
import { DeploymentArchitectureRepository } from './repositories/deployment-architecture.repository';
import { ArchitectureService } from './architecture.service';
import { ArchitectureController } from './architecture.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeploymentArchitectureEntity,
    ]),
  ],
  providers: [
    DeploymentArchitectureRepository,
    ArchitectureService,
  ],
  controllers: [
    ArchitectureController,
  ],
  exports: [
    ArchitectureService,
    DeploymentArchitectureRepository,
  ],
})
export class ArchitectureModule { }
