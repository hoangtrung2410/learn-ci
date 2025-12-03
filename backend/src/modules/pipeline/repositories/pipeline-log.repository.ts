import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PipelineLogEntity, LogStage, LogLevel } from '../entities/pipeline-log.entity';

@Injectable()
export class PipelineLogRepository extends Repository<PipelineLogEntity> {
    constructor(private dataSource: DataSource) {
        super(PipelineLogEntity, dataSource.createEntityManager());
    }

    async findByPipelineId(pipelineId: string): Promise<PipelineLogEntity[]> {
        return this.find({
            where: { pipeline_id: pipelineId },
            order: { createdAt: 'ASC' },
        });
    }

    async findByPipelineIdAndStage(
        pipelineId: string,
        stage: LogStage,
    ): Promise<PipelineLogEntity[]> {
        return this.find({
            where: { pipeline_id: pipelineId, stage },
            order: { createdAt: 'ASC' },
        });
    }

    async findErrorLogs(pipelineId: string): Promise<PipelineLogEntity[]> {
        return this.find({
            where: { pipeline_id: pipelineId, level: LogLevel.ERROR },
            order: { createdAt: 'ASC' },
        });
    }

    async addLog(
        pipelineId: string,
        stage: LogStage,
        message: string,
        level: LogLevel = LogLevel.INFO,
        metadata?: any,
        stackTrace?: string,
    ): Promise<PipelineLogEntity> {
        const log = this.create({
            pipeline_id: pipelineId,
            stage,
            level,
            message,
            metadata,
            stack_trace: stackTrace,
        });
        return this.save(log);
    }

    async deleteByPipelineId(pipelineId: string): Promise<void> {
        await this.delete({ pipeline_id: pipelineId });
    }
}
