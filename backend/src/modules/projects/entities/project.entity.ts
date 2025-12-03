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
import { AbstractEntity } from 'src/database/abstract/abstract.entity';

@Entity({ name: 'projects' })
export class ProjectEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  url_organization?: string;

  @Column({ type: 'uuid', nullable: true })
  architecture_id?: string;

  @ManyToOne(() => TokenEntity, (token) => token.projects, { nullable: true })
  @JoinColumn({ name: 'token_id' })
  token?: TokenEntity;

  @Column({ type: 'uuid', nullable: true })
  token_id?: string;

  @Column({ nullable: true })
  github_webhook_id?: number;

  @Column({ type: 'text', nullable: true })
  github_webhook_url?: string;

  @Column({ type: 'boolean', default: false })
  github_webhook_active?: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  github_webhook_created_at?: Date;

  @Column({ type: 'text', nullable: true })
  github_webhook_secret?: string;

  @OneToMany('PipelineEntity', 'project')
  pipelines?: any[];

  @OneToMany('AnalysisEntity', 'project')
  analyses?: any[];

  @ManyToOne('DeploymentArchitectureEntity', 'projects', { nullable: true })
  @JoinColumn({ name: 'architecture_id' })
  architecture?: any;

  @OneToMany('PipelineTemplateEntity', 'created_by_project')
  templates?: any[];
}
