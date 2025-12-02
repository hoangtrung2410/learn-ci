import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProjectEntity } from '../../projects/entities/project.entity';

/**
 * Pipeline Template Entity
 *
 * Represents reusable CI/CD pipeline templates
 * (e.g., Node.js Build, Docker Deploy, Kubernetes Deploy)
 */
@Entity({ name: 'pipeline_templates' })
export class PipelineTemplateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Template name
   */
  @Column({ type: 'varchar', length: 100 })
  name: string;

  /**
   * Template description
   */
  @Column({ type: 'text', nullable: true })
  description?: string;

  /**
   * Template category
   */
  @Column({ type: 'varchar', length: 50 })
  category: string; // build, test, deploy, full-pipeline

  /**
   * Platform this template is for
   */
  @Column({ type: 'varchar', length: 50 })
  platform: string; // github-actions, gitlab-ci, jenkins, etc.

  /**
   * Template content (YAML or JSON)
   */
  @Column({ type: 'text' })
  template_content: string;

  /**
   * Template version
   */
  @Column({ type: 'varchar', length: 20, default: '1.0.0' })
  version: string;

  /**
   * Template variables/parameters
   */
  @Column({ type: 'jsonb', nullable: true })
  variables?: Array<{
    name: string;
    description: string;
    type: 'string' | 'number' | 'boolean';
    default?: any;
    required: boolean;
  }>;

  /**
   * Template metadata
   */
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    tags?: string[];
    author?: string;
    estimated_duration?: number; // seconds
    complexity?: 'low' | 'medium' | 'high';
  };

  /**
   * Whether this template is published
   */
  @Column({ type: 'boolean', default: false })
  is_published: boolean;

  /**
   * Whether this template is verified
   */
  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  /**
   * Number of times this template has been used
   */
  @Column({ type: 'integer', default: 0 })
  usage_count: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => ProjectEntity, { nullable: true })
  @JoinColumn({ name: 'created_by_project_id' })
  created_by_project?: ProjectEntity;

  @Column({ type: 'uuid', nullable: true })
  created_by_project_id?: string;

  @OneToMany('ArchitectureTemplateMapEntity', 'template')
  architectureMaps?: any[];
}
