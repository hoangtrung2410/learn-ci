import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationDto } from '../../../database/dto/pagination.dto';
import { PipelineStatus, PipelineTrigger } from '../entities/pipeline.entity';

export class QueryPipelineDto extends PaginationDto {
  @IsEnum(PipelineStatus)
  @IsOptional()
  status?: PipelineStatus;

  @IsEnum(PipelineTrigger)
  @IsOptional()
  trigger?: PipelineTrigger;

  @IsUUID('4')
  @IsOptional()
  project_id?: string;
}
