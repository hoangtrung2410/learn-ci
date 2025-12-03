import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { LogLevel, LogStage } from '../entities/pipeline-log.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { QueryPaginationDto } from 'src/common/dto/query-pagination.dto';

export class QueryPipelineLogDto extends QueryPaginationDto {
    @ApiPropertyOptional({ enum: LogStage })
    @IsEnum(LogStage)
    @IsOptional()
    stage?: LogStage;

    @ApiPropertyOptional({ enum: LogLevel })
    @IsEnum(LogLevel)
    @IsOptional()
    level?: LogLevel;

    @ApiPropertyOptional()
    @IsUUID()
    @IsOptional()
    pipeline_id?: string;
}
