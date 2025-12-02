import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProjectEntity } from '../../projects/entities/project.entity';
import { ServiceType } from '../../pipeline/entities/pipeline.entity';

export enum AnalysisType {
  PERFORMANCE = 'performance',
  ARCHITECTURE = 'architecture',
  OPTIMIZATION = 'optimization',
  COMPARISON = 'comparison',
}

export enum RecommendationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity({ name: 'analyses' })
export class AnalysisEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: AnalysisType,
  })
  type: AnalysisType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb' })
  metrics: any; // Stored DORA + CI/CD metrics

  @Column({ type: 'jsonb' })
  comparison_data?: any; // Monolithic vs Microservices comparison

  @Column({ type: 'jsonb' })
  recommendations: Array<{
    title: string;
    description: string;
    priority: RecommendationPriority;
    impact: string;
    effort: string;
    category: 'build' | 'test' | 'deploy' | 'cache' | 'architecture';
  }>;

  @Column({
    type: 'enum',
    enum: ServiceType,
    nullable: true,
  })
  recommended_architecture?: ServiceType;

  @Column({ type: 'float', nullable: true })
  potential_improvement_percentage?: number;

  @Column({ type: 'timestamptz' })
  analysis_period_start: Date;

  @Column({ type: 'timestamptz' })
  analysis_period_end: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => ProjectEntity, { nullable: true })
  @JoinColumn({ name: 'project_id' })
  project?: ProjectEntity;

  @Column({ type: 'uuid', nullable: true })
  project_id?: string;
}
