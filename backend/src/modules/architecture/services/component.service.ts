import { Injectable, NotFoundException } from '@nestjs/common';
import { ArchitectureComponentRepository } from '../repositories/architecture-component.repository';
import { DeploymentArchitectureRepository } from '../repositories/deployment-architecture.repository';
import {
  CreateArchitectureComponentDto,
  UpdateArchitectureComponentDto,
} from '../dto';
import { ArchitectureComponentEntity } from '../entities';

/**
 * Service for managing architecture components
 */
@Injectable()
export class ComponentService {
  constructor(
    private readonly componentRepository: ArchitectureComponentRepository,
    private readonly architectureRepository: DeploymentArchitectureRepository,
  ) {}

  /**
   * Create a new component
   */
  async create(
    dto: CreateArchitectureComponentDto,
  ): Promise<ArchitectureComponentEntity> {
    // Verify architecture exists
    const architecture = await this.architectureRepository.findOne({
      where: { id: dto.architecture_id },
    });

    if (!architecture) {
      throw new NotFoundException(
        `Architecture with ID '${dto.architecture_id}' not found`,
      );
    }

    const component = new ArchitectureComponentEntity();
    component.name = dto.name;
    component.type = dto.type;
    component.description = dto.description;
    component.technology = dto.technology;
    component.architecture_id = dto.architecture_id;
    component.config = dto.config as any;
    component.deployment_config = dto.deployment_config as any;

    return this.componentRepository.save(component);
  }

  /**
   * Get all components, optionally filtered by architecture
   */
  async findAll(
    architectureId?: string,
  ): Promise<ArchitectureComponentEntity[]> {
    const where = architectureId ? { architecture_id: architectureId } : {};

    return this.componentRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  /**
   * Get a single component by ID
   */
  async findOne(id: string): Promise<ArchitectureComponentEntity> {
    const component = await this.componentRepository.findOne({
      where: { id },
      relations: ['architecture'],
    });

    if (!component) {
      throw new NotFoundException(`Component with ID '${id}' not found`);
    }

    return component;
  }

  /**
   * Update a component
   */
  async update(
    id: string,
    dto: UpdateArchitectureComponentDto,
  ): Promise<ArchitectureComponentEntity> {
    const component = await this.findOne(id);

    // Verify new architecture exists if being changed
    if (
      dto.architecture_id &&
      dto.architecture_id !== component.architecture_id
    ) {
      const architecture = await this.architectureRepository.findOne({
        where: { id: dto.architecture_id },
      });

      if (!architecture) {
        throw new NotFoundException(
          `Architecture with ID '${dto.architecture_id}' not found`,
        );
      }
    }

    Object.assign(component, dto);
    return this.componentRepository.save(component);
  }

  /**
   * Delete a component
   */
  async remove(id: string): Promise<void> {
    const component = await this.findOne(id);
    await this.componentRepository.remove(component);
  }
}
