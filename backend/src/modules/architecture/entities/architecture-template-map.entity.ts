import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DeploymentArchitectureEntity } from './deployment-architecture.entity';
import { PipelineTemplateEntity } from './pipeline-template.entity';

/**
 * Architecture Template Map Entity
 *
 * Maps pipeline templates to deployment architectures
 * Shows which templates are recommended for which architectures
 */
@Entity({ name: 'architecture_template_map' })
export class ArchitectureTemplateMapEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Recommended order/priority
   */
  @Column({ type: 'integer', default: 0 })
  priority: number;

  /**
   * Whether this template is recommended for this architecture
   */
  @Column({ type: 'boolean', default: true })
  is_recommended: boolean;

  /**
   * Whether this template is required for this architecture
   */
  @Column({ type: 'boolean', default: false })
  is_required: boolean;

  /**
   * Notes about why this template is recommended
   */
  @Column({ type: 'text', nullable: true })
  notes?: string;

  /**
   * Configuration overrides for this architecture
   */
  @Column({ type: 'jsonb', nullable: true })
  config_overrides?: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => DeploymentArchitectureEntity, (arch) => arch.templateMaps, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'architecture_id' })
  architecture: DeploymentArchitectureEntity;

  @Column({ type: 'uuid' })
  architecture_id: string;

  @ManyToOne(
    () => PipelineTemplateEntity,
    (template) => template.architectureMaps,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'template_id' })
  template: PipelineTemplateEntity;

  @Column({ type: 'uuid' })
  template_id: string;
}
