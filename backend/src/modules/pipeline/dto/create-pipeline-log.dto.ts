import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { LogLevel, LogStage } from '../entities/pipeline-log.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePipelineLogDto {
    @ApiPropertyOptional({ enum: LogStage })
    @IsEnum(LogStage)
    stage: LogStage;

    @ApiPropertyOptional({ enum: LogLevel })
    @IsEnum(LogLevel)
    @IsOptional()
    level?: LogLevel;

    @ApiPropertyOptional()
    @IsString()
    message: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    stack_trace?: string;

    @ApiPropertyOptional()
    @IsOptional()
    metadata?: any;

    @ApiPropertyOptional()
    @IsUUID()
    pipeline_id: string;
}
