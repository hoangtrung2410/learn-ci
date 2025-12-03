import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PipelineRepository } from './repositories/pipeline.repository';
import { PipelineLogRepository } from './repositories/pipeline-log.repository';
import { ProjectRepository } from '../projects/repositories/project.repository';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { UpdatePipelineDto } from './dto/update-pipeline.dto';
import { QueryPipelineDto } from './dto/query-pipeline.dto';
import { QueryPipelineLogDto } from './dto/query-pipeline-log.dto';
import { PipelineEntity, PipelineStatus } from './entities/pipeline.entity';
import { PipelineLogEntity, LogLevel, LogStage } from './entities/pipeline-log.entity';

@Injectable()
export class PipelineService {
  private readonly logger = new Logger(PipelineService.name);

  constructor(
    private readonly pipelineRepository: PipelineRepository,
    private readonly pipelineLogRepository: PipelineLogRepository,
    private readonly projectRepository: ProjectRepository,
  ) { }

  async create(data: CreatePipelineDto): Promise<PipelineEntity> {
    this.logger.log(`Creating pipeline ${data.name}`);
    try {
      // Verify project exists
      const project = await this.projectRepository.findOne({
        where: { id: data.project_id },
      });

      if (!project) {
        throw new NotFoundException(
          `Project with ID ${data.project_id} not found`,
        );
      }

      const pipeline = new PipelineEntity();
      pipeline.name = data.name;
      pipeline.status = data.status;
      pipeline.trigger = data.trigger;
      pipeline.branch = data.branch;
      pipeline.commit_sha = data.commit_sha;
      pipeline.commit_message = data.commit_message;
      pipeline.author = data.author;
      pipeline.repository_url = data.repository_url;
      pipeline.stages = data.stages;
      pipeline.metadata = data.metadata;
      pipeline.started_at = data.started_at;
      pipeline.finished_at = data.finished_at;
      pipeline.error_message = data.error_message;
      pipeline.project_id = data.project_id;
      pipeline.build_time = data.build_time;
      pipeline.test_time = data.test_time;
      pipeline.deploy_time = data.deploy_time;
      pipeline.artifact_storage_cost = data.artifact_storage_cost;
      pipeline.artifact_size_mb = data.artifact_size_mb;
      pipeline.lead_time = data.lead_time;
      pipeline.is_failed_deployment = data.is_failed_deployment;
      pipeline.is_rollback = data.is_rollback;
      pipeline.previous_pipeline_id = data.previous_pipeline_id;
      pipeline.architecture_id = data.architecture_id;

      return await this.pipelineRepository.save(pipeline);
    } catch (error) {
      this.logger.error(error?.stack);
      throw error;
    }
  }

  async update(id: string, data: UpdatePipelineDto): Promise<PipelineEntity> {
    this.logger.log(`Updating pipeline ${id}`);
    try {
      const pipeline = await this.pipelineRepository.findOne({
        where: { id },
        relations: ['project'],
      });

      if (!pipeline) {
        throw new NotFoundException(`Pipeline with ID ${id} not found`);
      }

      // If project_id is being updated, verify new project exists
      if (data.project_id && data.project_id !== pipeline.project_id) {
        const project = await this.projectRepository.findOne({
          where: { id: data.project_id },
        });

        if (!project) {
          throw new NotFoundException(
            `Project with ID ${data.project_id} not found`,
          );
        }

        pipeline.project = project;
      }

      // Calculate duration if finished_at is set and started_at exists
      if (data.finished_at && pipeline.started_at) {
        const duration =
          new Date(data.finished_at).getTime() -
          new Date(pipeline.started_at).getTime();
        pipeline.duration = Math.floor(duration / 1000); // Convert to seconds
      }

      Object.assign(pipeline, data);
      return await this.pipelineRepository.save(pipeline);
    } catch (error) {
      this.logger.error(error?.stack);
      throw error;
    }
  }

  async delete(id: string) {
    this.logger.log(`Deleting pipeline ${id}`);
    try {
      const result = await this.pipelineRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Pipeline with ID ${id} not found`);
      }
      return result;
    } catch (error) {
      this.logger.error(error?.stack);
      throw error;
    }
  }

  async getDetail(id: string): Promise<PipelineEntity> {
    this.logger.log(`Getting pipeline ${id}`);
    const pipeline = await this.pipelineRepository.findOne({
      where: { id },
      relations: ['project', 'logs'],
    });

    if (!pipeline) {
      throw new NotFoundException(`Pipeline with ID ${id} not found`);
    }

    return pipeline;
  }

  async getList(query: QueryPipelineDto) {
    this.logger.log('Getting pipeline list');
    try {
      const { limit = 10, offset = 0, status, trigger, project_id } = query;

      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (trigger) {
        where.trigger = trigger;
      }

      if (project_id) {
        where.project_id = project_id;
      }

      const [data, total] = await this.pipelineRepository.findAndCount({
        where,
        relations: ['project'],
        take: Number(limit),
        skip: Number(offset),
        order: { createdAt: 'DESC' },
      });

      return {
        data,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
        },
      };
    } catch (error) {
      this.logger.error(error?.stack);
      throw error;
    }
  }

  async updateStatus(
    id: string,
    status: PipelineStatus,
    errorMessage?: string,
  ): Promise<PipelineEntity> {
    this.logger.log(`Updating pipeline ${id} status to ${status}`);
    const pipeline = await this.getDetail(id);

    pipeline.status = status;

    // Set started_at when status becomes RUNNING
    if (status === PipelineStatus.RUNNING && !pipeline.started_at) {
      pipeline.started_at = new Date();
    }

    // Set finished_at and calculate duration when status is terminal
    if (
      [
        PipelineStatus.SUCCESS,
        PipelineStatus.FAILED,
        PipelineStatus.CANCELLED,
        PipelineStatus.SKIPPED,
      ].includes(status)
    ) {
      pipeline.finished_at = new Date();

      if (pipeline.started_at) {
        const duration =
          pipeline.finished_at.getTime() - pipeline.started_at.getTime();
        pipeline.duration = Math.floor(duration / 1000);
      }

      if (status === PipelineStatus.FAILED && errorMessage) {
        pipeline.error_message = errorMessage;
      }
    }

    return await this.pipelineRepository.save(pipeline);
  }

  async getStatistics(projectId?: string) {
    this.logger.log('Getting pipeline statistics');
    try {
      const where: any = {};
      if (projectId) {
        where.project_id = projectId;
      }

      const total = await this.pipelineRepository.count({ where });

      const success = await this.pipelineRepository.count({
        where: { ...where, status: PipelineStatus.SUCCESS },
      });

      const failed = await this.pipelineRepository.count({
        where: { ...where, status: PipelineStatus.FAILED },
      });

      const running = await this.pipelineRepository.count({
        where: { ...where, status: PipelineStatus.RUNNING },
      });

      const pending = await this.pipelineRepository.count({
        where: { ...where, status: PipelineStatus.PENDING },
      });

      return {
        total,
        success,
        failed,
        running,
        pending,
        successRate: total > 0 ? ((success / total) * 100).toFixed(2) : '0',
      };
    } catch (error) {
      this.logger.error(error?.stack);
      throw error;
    }
  }

  // Pipeline Log Methods
  async addLog(
    pipelineId: string,
    stage: LogStage,
    message: string,
    level: LogLevel = LogLevel.INFO,
    metadata?: any,
    stackTrace?: string,
  ): Promise<PipelineLogEntity> {
    this.logger.log(`Adding log to pipeline ${pipelineId} - Stage: ${stage}`);

    // Verify pipeline exists
    await this.getDetail(pipelineId);

    return this.pipelineLogRepository.addLog(
      pipelineId,
      stage,
      message,
      level,
      metadata,
      stackTrace,
    );
  }

  async getPipelineLogs(
    pipelineId: string,
    query?: QueryPipelineLogDto,
  ): Promise<PipelineLogEntity[]> {
    this.logger.log(`Getting logs for pipeline ${pipelineId}`);

    // Verify pipeline exists
    await this.getDetail(pipelineId);

    if (query?.stage) {
      return this.pipelineLogRepository.findByPipelineIdAndStage(
        pipelineId,
        query.stage,
      );
    }

    return this.pipelineLogRepository.findByPipelineId(pipelineId);
  }

  async getErrorLogs(pipelineId: string): Promise<PipelineLogEntity[]> {
    this.logger.log(`Getting error logs for pipeline ${pipelineId}`);

    // Verify pipeline exists
    await this.getDetail(pipelineId);

    return this.pipelineLogRepository.findErrorLogs(pipelineId);
  }

  async getPipelineWithLogs(id: string): Promise<PipelineEntity> {
    this.logger.log(`Getting pipeline ${id} with logs`);

    const pipeline = await this.pipelineRepository.findOne({
      where: { id },
      relations: ['project', 'architecture', 'logs'],
    });

    if (!pipeline) {
      throw new NotFoundException(`Pipeline with ID ${id} not found`);
    }

    return pipeline;
  }

  async logStageStart(
    pipelineId: string,
    stage: LogStage,
  ): Promise<PipelineLogEntity> {
    return this.addLog(
      pipelineId,
      stage,
      `${stage.toUpperCase()} stage started`,
      LogLevel.INFO,
      { event: 'stage_start', timestamp: new Date() },
    );
  }

  async logStageComplete(
    pipelineId: string,
    stage: LogStage,
    duration: number,
  ): Promise<PipelineLogEntity> {
    return this.addLog(
      pipelineId,
      stage,
      `${stage.toUpperCase()} stage completed in ${duration}s`,
      LogLevel.INFO,
      { event: 'stage_complete', duration, timestamp: new Date() },
    );
  }

  async logStageError(
    pipelineId: string,
    stage: LogStage,
    error: Error,
  ): Promise<PipelineLogEntity> {
    // Update pipeline failed_stage
    const pipeline = await this.getDetail(pipelineId);
    pipeline.failed_stage = stage;
    pipeline.error_message = error.message;
    await this.pipelineRepository.save(pipeline);

    return this.addLog(
      pipelineId,
      stage,
      `${stage.toUpperCase()} stage failed: ${error.message}`,
      LogLevel.ERROR,
      { event: 'stage_error', timestamp: new Date() },
      error.stack,
    );
  }
}
