import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ProjectEntity } from '../../projects/entities/project.entity';
import { DeploymentArchitectureEntity } from '../../architecture/entities/deployment-architecture.entity';
import { AbstractEntity } from 'src/database/abstract/abstract.entity';
import { PipelineLogEntity } from './pipeline-log.entity';

export enum PipelineStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  SKIPPED = 'skipped',
}

export enum PipelineTrigger {
  PUSH = 'push',
  PULL_REQUEST = 'pull_request',
  MANUAL = 'manual',
  SCHEDULE = 'schedule',
  TAG = 'tag',
}

@Entity({ name: 'pipelines' })
export class PipelineEntity extends AbstractEntity {

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: PipelineStatus,
    default: PipelineStatus.PENDING,
  })
  status: PipelineStatus;

  @Column({
    type: 'enum',
    enum: PipelineTrigger,
    default: PipelineTrigger.PUSH,
  })
  trigger: PipelineTrigger;

  @Column({ type: 'varchar', length: 255, nullable: true })
  branch?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  commit_sha?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  commit_message?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  author?: string;

  @Column({ type: 'text', nullable: true })
  repository_url?: string;

  @Column({ type: 'jsonb', nullable: true })
  stages?: any;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @Column({ type: 'timestamptz', nullable: true })
  started_at?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  finished_at?: Date;

  @Column({ type: 'integer', nullable: true })
  duration?: number;

  @Column({ type: 'integer', nullable: true })
  build_time?: number;

  @Column({ type: 'integer', nullable: true })
  test_time?: number;

  @Column({ type: 'integer', nullable: true })
  deploy_time?: number;

  @Column({ type: 'float', nullable: true })
  artifact_storage_cost?: number;

  @Column({ type: 'integer', nullable: true })
  artifact_size_mb?: number;

  @Column({ type: 'integer', nullable: true })
  lead_time?: number;

  @Column({ type: 'boolean', default: false })
  is_failed_deployment: boolean;

  @Column({ type: 'boolean', default: false })
  is_rollback: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  previous_pipeline_id?: string;

  @Column({ type: 'text', nullable: true })
  error_message?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  failed_stage?: string;

  @ManyToOne(() => ProjectEntity, { nullable: false })
  @JoinColumn({ name: 'project_id' })
  project: ProjectEntity;

  @Column({ type: 'uuid' })
  project_id: string;

  @ManyToOne(
    () => DeploymentArchitectureEntity,
    (architecture) => architecture.pipelines,
    { nullable: true },
  )
  @JoinColumn({ name: 'architecture_id' })
  architecture?: DeploymentArchitectureEntity;

  @Column({ type: 'uuid', nullable: true })
  architecture_id?: string;

  @OneToMany(() => PipelineLogEntity, (log) => log.pipeline, {
    cascade: true,
  })
  logs: PipelineLogEntity[];
}
