import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  OneToMany,
} from 'typeorm';

/**
 * Deployment Architecture Entity
 *
 * Represents different deployment architectures (Monolithic, Microservices, Serverless, etc.)
 * Used to categorize and analyze CI/CD performance by architecture type
 */
@Entity({ name: 'deployment_architectures' })
export class DeploymentArchitectureEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Architecture name (e.g., "Monolithic", "Microservices", "Serverless")
   */
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  /**
   * Architecture description
   */
  @Column({ type: 'text', nullable: true })
  description?: string;

  /**
   * Architecture key for programmatic access
   */
  @Column({ type: 'varchar', length: 50, unique: true })
  key: string; // monolithic, microservices, serverless, hybrid

  /**
   * Whether this architecture is active
   */
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  /**
   * Metadata for architecture characteristics
   */
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    pros?: string[];
    cons?: string[];
    best_for?: string[];
    complexity?: 'low' | 'medium' | 'high';
    scalability?: 'low' | 'medium' | 'high';
    maintenance?: 'low' | 'medium' | 'high';
  };

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Relationships
  @OneToMany('ArchitectureComponentEntity', 'architecture')
  components?: any[];

  @OneToMany('ArchitectureTemplateMapEntity', 'architecture')
  templateMaps?: any[];

  @OneToMany('ProjectEntity', 'architecture')
  projects?: any[];

  @OneToMany('PipelineEntity', 'architecture')
  pipelines?: any[];
}
