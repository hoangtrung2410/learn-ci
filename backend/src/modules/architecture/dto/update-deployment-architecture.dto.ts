import { PartialType } from '@nestjs/swagger';
import { CreateDeploymentArchitectureDto } from './create-deployment-architecture.dto';

/**
 * DTO for updating a deployment architecture
 * All fields are optional
 */
export class UpdateDeploymentArchitectureDto extends PartialType(
  CreateDeploymentArchitectureDto,
) {}
