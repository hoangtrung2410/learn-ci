import { PartialType } from '@nestjs/swagger';
import { CreatePipelineTemplateDto } from './create-pipeline-template.dto';

/**
 * DTO for updating a pipeline template
 * All fields are optional
 */
export class UpdatePipelineTemplateDto extends PartialType(
  CreatePipelineTemplateDto,
) {}
