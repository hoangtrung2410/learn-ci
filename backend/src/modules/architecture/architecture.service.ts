import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DeploymentArchitectureRepository } from './repositories/deployment-architecture.repository';
import {
  CreateDeploymentArchitectureDto,
  UpdateDeploymentArchitectureDto,
} from './dto';
import { DeploymentArchitectureEntity } from './entities';

@Injectable()
export class ArchitectureService {
  constructor(
    private readonly architectureRepository: DeploymentArchitectureRepository,
  ) { }

  async create(
    dto: CreateDeploymentArchitectureDto,
  ): Promise<DeploymentArchitectureEntity> {
    // Check if architecture with same key exists
    const existing = await this.architectureRepository.findOne({
      where: { key: dto.key },
    });

    if (existing) {
      throw new ConflictException(
        `Architecture with key '${dto.key}' already exists`,
      );
    }

    const architecture = new DeploymentArchitectureEntity();
    architecture.name = dto.name;
    architecture.key = dto.key;
    architecture.description = dto.description;
    architecture.metadata = dto.metadata as any;

    return this.architectureRepository.save(architecture);
  }

  /**
   * Get all deployment architectures
   */
  async findAll(): Promise<DeploymentArchitectureEntity[]> {
    return this.architectureRepository.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Get a single architecture by ID
   */
  async findOne(id: string): Promise<DeploymentArchitectureEntity> {
    const architecture = await this.architectureRepository.findOne({
      where: { id },
      relations: ['components', 'templateMaps'],
    });

    if (!architecture) {
      throw new NotFoundException(`Architecture with ID '${id}' not found`);
    }

    return architecture;
  }

  /**
   * Get architecture by key
   */
  async findByKey(key: string): Promise<DeploymentArchitectureEntity> {
    const architecture = await this.architectureRepository.findOne({
      where: { key },
    });

    if (!architecture) {
      throw new NotFoundException(`Architecture with key '${key}' not found`);
    }

    return architecture;
  }

  /**
   * Update an architecture
   */
  async update(
    id: string,
    dto: UpdateDeploymentArchitectureDto,
  ): Promise<DeploymentArchitectureEntity> {
    const architecture = await this.findOne(id);

    // Check key uniqueness if being updated
    if (dto.key && dto.key !== architecture.key) {
      const existing = await this.architectureRepository.findOne({
        where: { key: dto.key },
      });

      if (existing) {
        throw new ConflictException(
          `Architecture with key '${dto.key}' already exists`,
        );
      }
    }

    Object.assign(architecture, dto);
    return this.architectureRepository.save(architecture);
  }

  /**
   * Delete an architecture
   */
  async remove(id: string): Promise<void> {
    const architecture = await this.findOne(id);
    await this.architectureRepository.remove(architecture);
  }

  /**
   * Get architecture statistics
   */
  async getStatistics(id: string): Promise<{
    total_projects: number;
    total_components: number;
    total_templates: number;
  }> {
    const architecture = await this.architectureRepository.findOne({
      where: { id },
      relations: ['projects'],
    });

    if (!architecture) {
      throw new NotFoundException(`Architecture with ID '${id}' not found`);
    }

    const total_projects = architecture.projects ? architecture.projects.length : 0;

    // For simplicity, assuming components and templates are not implemented yet
    const total_components = 0;
    const total_templates = 0;

    return {
      total_projects,
      total_components,
      total_templates,
    };
  }
}
