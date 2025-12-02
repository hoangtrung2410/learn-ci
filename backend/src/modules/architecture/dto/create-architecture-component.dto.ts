import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating an architecture component
 */
export class CreateArchitectureComponentDto {
  @ApiProperty({ description: 'Component name', example: 'User Service' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Component type', example: 'service' })
  @IsString()
  @IsNotEmpty()
  type: string; // service, database, cache, queue, gateway

  @ApiPropertyOptional({ description: 'Component description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Technology stack', example: 'Node.js' })
  @IsString()
  @IsOptional()
  technology?: string;

  @ApiProperty({ description: 'Architecture ID this component belongs to' })
  @IsUUID()
  @IsNotEmpty()
  architecture_id: string;

  @ApiPropertyOptional({
    description: 'Component configuration',
    example: {
      port: 3000,
      replicas: 3,
      resources: { cpu: '500m', memory: '512Mi' },
    },
  })
  @IsObject()
  @IsOptional()
  config?: {
    port?: number;
    replicas?: number;
    resources?: { cpu?: string; memory?: string };
    environment?: Record<string, string>;
    dependencies?: string[];
    [key: string]: any;
  };

  @ApiPropertyOptional({
    description: 'Deployment configuration',
    example: {
      strategy: 'RollingUpdate',
      health_check: '/health',
      readiness_probe: '/ready',
    },
  })
  @IsObject()
  @IsOptional()
  deployment_config?: {
    strategy?: string;
    health_check?: string;
    readiness_probe?: string;
    [key: string]: any;
  };
}
