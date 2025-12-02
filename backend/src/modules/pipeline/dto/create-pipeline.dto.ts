import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsObject,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PipelineStatus, PipelineTrigger } from '../entities/pipeline.entity';

export class CreatePipelineDto {
  @ApiProperty({
    description: 'Pipeline name',
    example: 'Build & Deploy - Frontend',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Pipeline execution status',
    enum: PipelineStatus,
    example: PipelineStatus.SUCCESS,
    default: PipelineStatus.PENDING,
  })
  @IsEnum(PipelineStatus)
  @IsOptional()
  status?: PipelineStatus;

  @ApiPropertyOptional({
    description: 'What triggered the pipeline',
    enum: PipelineTrigger,
    example: PipelineTrigger.PUSH,
  })
  @IsEnum(PipelineTrigger)
  @IsOptional()
  trigger?: PipelineTrigger;

  @ApiPropertyOptional({
    description: 'Git branch name',
    example: 'main',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  branch?: string;

  @ApiPropertyOptional({
    description: 'Git commit SHA',
    example: 'abc123def456789',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  commit_sha?: string;

  @ApiPropertyOptional({
    description: 'Git commit message',
    example: 'feat: add new authentication module',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  commit_message?: string;

  @ApiPropertyOptional({
    description: 'Commit author name',
    example: 'John Doe',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  author?: string;

  @ApiPropertyOptional({
    description: 'Repository URL',
    example: 'https://github.com/user/repo',
  })
  @IsString()
  @IsOptional()
  repository_url?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata in JSON format',
    example: { runner: 'ubuntu-latest', node_version: '18' },
  })
  @IsObject()
  @IsOptional()
  stages?: any;

  @ApiPropertyOptional({
    description: 'Additional pipeline metadata',
    example: { ci_provider: 'github-actions' },
  })
  @IsObject()
  @IsOptional()
  metadata?: any;

  @ApiPropertyOptional({
    description: 'Pipeline start timestamp',
    example: '2024-12-01T10:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  started_at?: Date;

  @ApiPropertyOptional({
    description: 'Pipeline finish timestamp',
    example: '2024-12-01T10:06:30Z',
  })
  @IsDateString()
  @IsOptional()
  finished_at?: Date;

  @ApiPropertyOptional({
    description: 'Error message if pipeline failed',
    example: 'Unit tests failed in authentication module',
  })
  @IsString()
  @IsOptional()
  error_message?: string;

  @ApiProperty({
    description: 'Project UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID('4')
  project_id: string;

  @ApiPropertyOptional({
    description: 'Service type',
    enum: ['monolithic', 'microservices', 'hybrid'],
    example: 'microservices',
  })
  @IsEnum(['monolithic', 'microservices', 'hybrid'])
  @IsOptional()
  service_type?: string;

  @ApiPropertyOptional({
    description: 'Build duration in seconds',
    example: 180,
    minimum: 0,
  })
  @IsOptional()
  build_time?: number;

  @ApiPropertyOptional({
    description: 'Test duration in seconds',
    example: 120,
    minimum: 0,
  })
  @IsOptional()
  test_time?: number;

  @ApiPropertyOptional({
    description: 'Deploy duration in seconds',
    example: 90,
    minimum: 0,
  })
  @IsOptional()
  deploy_time?: number;

  @ApiPropertyOptional({
    description: 'Artifact storage cost in USD',
    example: 2.5,
    minimum: 0,
  })
  @IsOptional()
  artifact_storage_cost?: number;

  @ApiPropertyOptional({
    description: 'Artifact size in megabytes',
    example: 125.5,
    minimum: 0,
  })
  @IsOptional()
  artifact_size_mb?: number;

  @ApiPropertyOptional({
    description: 'Lead time from commit to deploy in hours',
    example: 24.5,
    minimum: 0,
  })
  @IsOptional()
  lead_time?: number;

  @ApiPropertyOptional({
    description: 'Whether this deployment failed',
    example: false,
  })
  @IsOptional()
  is_failed_deployment?: boolean;

  @ApiPropertyOptional({
    description: 'Whether this is a rollback deployment',
    example: false,
  })
  @IsOptional()
  is_rollback?: boolean;

  @ApiPropertyOptional({
    description: 'Previous pipeline UUID if this is a rollback',
    example: '987e6543-e89b-12d3-a456-426614174999',
    format: 'uuid',
  })
  @IsOptional()
  previous_pipeline_id?: string;

  @ApiPropertyOptional({
    description: 'Deployment architecture UUID',
    example: '456e7890-e89b-12d3-a456-426614174111',
    format: 'uuid',
  })
  @IsUUID('4')
  @IsOptional()
  architecture_id?: string;
}
