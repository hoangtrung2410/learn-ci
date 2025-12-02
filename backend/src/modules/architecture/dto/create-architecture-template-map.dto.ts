import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  IsString,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for mapping a template to an architecture
 */
export class CreateArchitectureTemplateMapDto {
  @ApiProperty({ description: 'Architecture ID' })
  @IsUUID()
  @IsNotEmpty()
  architecture_id: string;

  @ApiProperty({ description: 'Template ID' })
  @IsUUID()
  @IsNotEmpty()
  template_id: string;

  @ApiPropertyOptional({ description: 'Priority order', default: 0 })
  @IsInt()
  @IsOptional()
  priority?: number;

  @ApiPropertyOptional({
    description: 'Is this template recommended for this architecture',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  is_recommended?: boolean;

  @ApiPropertyOptional({
    description: 'Is this template required for this architecture',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  is_required?: boolean;

  @ApiPropertyOptional({ description: 'Additional notes or recommendations' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Configuration overrides specific to this architecture',
    example: { replicas: 5, enable_autoscaling: true },
  })
  @IsObject()
  @IsOptional()
  config_overrides?: Record<string, any>;
}
