import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ProjectRepository } from './repositories/project.repository';
import { TokenRepository } from '../token/repositories/token.repository';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationDto } from '../../database/dto/pagination.dto';
import { ProjectEntity } from './entities/project.entity';
import { In } from 'typeorm';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly tokenRepository: TokenRepository,
  ) {}

  async create(data: CreateProjectDto): Promise<ProjectEntity> {
    this.logger.log(`Creating project ${data.name}`);
    try {
      if (!data.tokenId) {
        throw new NotFoundException(`Token ID is required`);
      }
      const token = await this.tokenRepository.findOne({
        where: { id: data.tokenId },
      });

      if (!token) {
        throw new NotFoundException(`Token with ID ${data.tokenId} not found`);
      }

      const project = new ProjectEntity();
      project.name = data.name;
      project.description = data.description;
      project.url_organization = data.url_organization;
      project.token_id = data.tokenId;

      return await this.projectRepository.save(project);
    } catch (error) {
      this.logger.error(error?.stack);
      throw error;
    }
  }

  async update(id: string, data: UpdateProjectDto): Promise<ProjectEntity> {
    this.logger.log(`Updating project ${id}`);
    try {
      const project = await this.projectRepository.findOne({ where: { id } });
      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }
      if (data.tokenId) {
        const token = await this.tokenRepository.findOne({
          where: { id: data.tokenId },
        });
        if (!token) {
          throw new NotFoundException(
            `Token with ID ${data.tokenId} not found`,
          );
        }
        project.token_id = data.tokenId;
      }

      if (data.name) project.name = data.name;
      if (data.description) project.description = data.description;
      if (data.url_organization)
        project.url_organization = data.url_organization;

      return await this.projectRepository.save(project);
    } catch (error) {
      this.logger.error(error?.stack);
      throw error;
    }
  }

  async delete(id: string) {
    this.logger.log(`Deleting project ${id}`);
    try {
      return this.projectRepository.delete(id);
    } catch (error) {
      this.logger.error(error?.stack);
      throw error;
    }
  }

  async getDetail(id: string) {
    this.logger.log(`Getting project ${id}`);
    return this.projectRepository.findOne({
      where: { id },
      relations: ['token', 'pipelines', 'analyses'],
    });
  }

  async getAll(data: PaginationDto) {
    this.logger.log(`Getting all projects`);
    try {
      return this.projectRepository.find({
        skip: data.offset,
        take: data.limit,
      });
    } catch (error) {
      this.logger.error(error?.stack);
      throw error;
    }
  }
}
