import { AbstractEntity } from 'src/database/abstract/abstract.entity';
import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  OneToMany,
} from 'typeorm';

@Entity({ name: 'deployment_architectures' })
export class DeploymentArchitectureEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;


  @Column({ type: 'varchar', length: 50, unique: true })
  key: string; // monolithic, microservices, serverless, hybrid


  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    pros?: string[];
    cons?: string[];
    best_for?: string[];
    complexity?: 'low' | 'medium' | 'high';
    scalability?: 'low' | 'medium' | 'high';
    maintenance?: 'low' | 'medium' | 'high';
  };

  @OneToMany('ArchitectureComponentEntity', 'architecture')
  components?: any[];

  @OneToMany('ArchitectureTemplateMapEntity', 'architecture')
  templateMaps?: any[];

  @OneToMany('ProjectEntity', 'architecture')
  projects?: any[];

  @OneToMany('PipelineEntity', 'architecture')
  pipelines?: any[];
}
