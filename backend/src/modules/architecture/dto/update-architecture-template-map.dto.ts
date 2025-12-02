import { PartialType } from '@nestjs/swagger';
import { CreateArchitectureTemplateMapDto } from './create-architecture-template-map.dto';

/**
 * DTO for updating an architecture-template mapping
 * All fields are optional except the IDs
 */
export class UpdateArchitectureTemplateMapDto extends PartialType(
  CreateArchitectureTemplateMapDto,
) {}
