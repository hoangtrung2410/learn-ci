import { PartialType } from '@nestjs/swagger';
import { CreateArchitectureComponentDto } from './create-architecture-component.dto';

/**
 * DTO for updating an architecture component
 * All fields are optional
 */
export class UpdateArchitectureComponentDto extends PartialType(
  CreateArchitectureComponentDto,
) {}
