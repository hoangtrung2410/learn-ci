import { Injectable, NotFoundException } from '@nestjs/common';
import { PipelineTemplateRepository } from '../repositories/pipeline-template.repository';
import {
  CreatePipelineTemplateDto,
  UpdatePipelineTemplateDto,
  CreateArchitectureTemplateMapDto,
} from '../dto';
import { PipelineTemplateEntity } from '../entities';
import { ArchitectureTemplateMapRepository } from '../repositories/architecture-template-map.repository';

@Injectable()
export class TemplateService {
  constructor(
    private readonly templateRepository: PipelineTemplateRepository,
    private readonly templateMapRepository: ArchitectureTemplateMapRepository,
  ) {}

  /**
   * Create a new pipeline template
   */
  async create(
    dto: CreatePipelineTemplateDto,
  ): Promise<PipelineTemplateEntity> {
    const template = new PipelineTemplateEntity();
    template.name = dto.name;
    template.description = dto.description;
    template.platform = dto.platform;
    template.template_content = dto.template_content;
    template.version = dto.version;
    template.variables = dto.variables as any;
    template.metadata = dto.metadata as any;
    template.is_published = dto.is_published ?? false;
    template.is_verified = dto.is_verified ?? false;
    template.created_by_project_id = dto.created_by_project_id;

    return this.templateRepository.save(template);
  }

  /**
   * Get all templates, with optional filters
   */
  async findAll(filters?: {
    platform?: string;
    is_published?: boolean;
    is_verified?: boolean;
  }): Promise<PipelineTemplateEntity[]> {
    const where: any = {};

    if (filters?.platform) {
      where.platform = filters.platform;
    }
    if (filters?.is_published !== undefined) {
      where.is_published = filters.is_published;
    }
    if (filters?.is_verified !== undefined) {
      where.is_verified = filters.is_verified;
    }

    return this.templateRepository.find({
      where,
      order: { usage_count: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * Get a single template by ID
   */
  async findOne(id: string): Promise<PipelineTemplateEntity> {
    const template = await this.templateRepository.findOne({
      where: { id },
      relations: ['architectureMaps', 'createdByProject'],
    });

    if (!template) {
      throw new NotFoundException(`Template with ID '${id}' not found`);
    }

    return template;
  }

  /**
   * Update a template
   */
  async update(
    id: string,
    dto: UpdatePipelineTemplateDto,
  ): Promise<PipelineTemplateEntity> {
    const template = await this.findOne(id);

    Object.assign(template, {
      ...dto,
      variables: dto.variables as any,
      metadata: dto.metadata as any,
    });

    return this.templateRepository.save(template);
  }

  /**
   * Delete a template
   */
  async remove(id: string): Promise<void> {
    const template = await this.findOne(id);
    await this.templateRepository.remove(template);
  }

  /**
   * Increment usage count when template is used
   */
  async incrementUsage(id: string): Promise<void> {
    const template = await this.findOne(id);
    template.usage_count = (template.usage_count || 0) + 1;
    await this.templateRepository.save(template);
  }

  /**
   * Get templates recommended for a specific architecture
   */
  async getTemplatesForArchitecture(architectureId: string): Promise<
    Array<{
      template: PipelineTemplateEntity;
      is_recommended: boolean;
      is_required: boolean;
      priority: number;
    }>
  > {
    const mappings = await this.templateMapRepository.find({
      where: { architecture_id: architectureId },
      relations: ['template'],
      order: { priority: 'ASC' },
    });

    return mappings.map((mapping) => ({
      template: mapping.template as PipelineTemplateEntity,
      is_recommended: mapping.is_recommended,
      is_required: mapping.is_required,
      priority: mapping.priority,
    }));
  }

  /**
   * Map a template to an architecture
   */
  async mapToArchitecture(dto: CreateArchitectureTemplateMapDto) {
    // Check if mapping already exists
    const existing = await this.templateMapRepository.findOne({
      where: {
        architecture_id: dto.architecture_id,
        template_id: dto.template_id,
      },
    });

    if (existing) {
      // Update existing mapping
      Object.assign(existing, dto);
      return this.templateMapRepository.save(existing);
    }

    // Create new mapping
    const mapping: any = this.templateMapRepository.create(dto);
    return this.templateMapRepository.save(mapping);
  }

  /**
   * Remove template mapping from architecture
   */
  async unmapFromArchitecture(
    architectureId: string,
    templateId: string,
  ): Promise<void> {
    const mapping = await this.templateMapRepository.findOne({
      where: {
        architecture_id: architectureId,
        template_id: templateId,
      },
    });

    if (mapping) {
      await this.templateMapRepository.remove(mapping);
    }
  }
}
