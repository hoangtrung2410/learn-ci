import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { TokenEntity } from '../../token/entities/token.entity';

@Entity({ name: 'projects' })
export class ProjectEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  url_organization?: string;

  /**
   * Deployment architecture type for this project
   */
  @Column({ type: 'uuid', nullable: true })
  architecture_id?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Many projects can use one token
  @ManyToOne(() => TokenEntity, (token) => token.projects, { nullable: true })
  @JoinColumn({ name: 'token_id' })
  token?: TokenEntity;

  @Column({ type: 'uuid', nullable: true })
  token_id?: string;

  // One project has many pipelines
  @OneToMany('PipelineEntity', 'project')
  pipelines?: any[];

  // One project has many analyses
  @OneToMany('AnalysisEntity', 'project')
  analyses?: any[];

  // Project belongs to a deployment architecture
  @ManyToOne('DeploymentArchitectureEntity', 'projects', { nullable: true })
  @JoinColumn({ name: 'architecture_id' })
  architecture?: any;

  // Project can create custom templates
  @OneToMany('PipelineTemplateEntity', 'created_by_project')
  templates?: any[];
}
