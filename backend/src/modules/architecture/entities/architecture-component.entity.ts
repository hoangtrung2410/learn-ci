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

/**
 * Architecture Component Entity
 *
 * Represents components/services within an architecture
 * (e.g., API Gateway, Auth Service, Database, Cache, etc.)
 */
@Entity({ name: 'architecture_components' })
export class ArchitectureComponentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Component name (e.g., "API Gateway", "Auth Service")
   */
  @Column({ type: 'varchar', length: 100 })
  name: string;

  /**
   * Component type
   */
  @Column({ type: 'varchar', length: 50 })
  type: string; // service, database, cache, queue, gateway, etc.

  /**
   * Component description
   */
  @Column({ type: 'text', nullable: true })
  description?: string;

  /**
   * Technology stack used
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  technology?: string; // Node.js, Python, PostgreSQL, Redis, etc.

  /**
   * Component configuration
   */
  @Column({ type: 'jsonb', nullable: true })
  config?: {
    port?: number;
    replicas?: number;
    resources?: {
      cpu?: string;
      memory?: string;
    };
    environment?: Record<string, string>;
    dependencies?: string[]; // IDs of other components
  };

  /**
   * Deployment configuration
   */
  @Column({ type: 'jsonb', nullable: true })
  deployment_config?: {
    strategy?: 'rolling' | 'blue-green' | 'canary';
    health_check?: string;
    readiness_probe?: string;
    liveness_probe?: string;
  };

  /**
   * Display order in architecture diagram
   */
  @Column({ type: 'integer', default: 0 })
  display_order: number;

  /**
   * Whether this component is active
   */
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => DeploymentArchitectureEntity, (arch) => arch.components, {
    nullable: false,
  })
  @JoinColumn({ name: 'architecture_id' })
  architecture: DeploymentArchitectureEntity;

  @Column({ type: 'uuid' })
  architecture_id: string;
}
