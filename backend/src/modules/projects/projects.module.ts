import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectEntity } from './entities/project.entity';
import { ProjectRepository } from './repositories/project.repository';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectEntity]), TokenModule],
  controllers: [ProjectsController],
  providers: [ProjectRepository, ProjectsService],
  exports: [ProjectsService, ProjectRepository],
})
export class ProjectsModule {}
