import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    Index,
} from 'typeorm';
import { PipelineEntity } from './pipeline.entity';
import { AbstractEntity } from 'src/database/abstract/abstract.entity';

export enum LogLevel {
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error',
    DEBUG = 'debug',
}

export enum LogStage {
    INIT = 'init',
    BUILD = 'build',
    TEST = 'test',
    DEPLOY = 'deploy',
    CLEANUP = 'cleanup',
}

@Entity({ name: 'pipeline_logs' })
@Index(['pipeline_id', 'stage'])
@Index(['pipeline_id', 'createdAt'])
export class PipelineLogEntity extends AbstractEntity {

    @Column({
        type: 'enum',
        enum: LogStage,
    })
    stage: LogStage;

    @Column({
        type: 'enum',
        enum: LogLevel,
        default: LogLevel.INFO,
    })
    level: LogLevel;

    @Column({ type: 'text' })
    message: string;

    @Column({ type: 'text', nullable: true })
    stack_trace?: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata?: any;

    @Column({ type: 'integer', nullable: true })
    line_number?: number;

    @ManyToOne(() => PipelineEntity, (pipeline) => pipeline.logs, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'pipeline_id' })
    pipeline: PipelineEntity;

    @Column({ type: 'uuid' })
    pipeline_id: string;
}
