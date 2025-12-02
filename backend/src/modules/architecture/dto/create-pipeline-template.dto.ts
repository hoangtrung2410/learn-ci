import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsBoolean,
  IsObject,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a pipeline template
 */
export class CreatePipelineTemplateDto {
  @ApiProperty({
    description: 'Template name',
    example: 'Node.js Microservice CI/CD',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Template description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'CI/CD platform', example: 'github-actions' })
  @IsString()
  @IsNotEmpty()
  platform: string; // github-actions, gitlab-ci, jenkins

  @ApiProperty({
    description: 'Template content (YAML/JSON)',
    example: 'name: CI\non:\n  push:\n    branches: [main]',
  })
  @IsString()
  @IsNotEmpty()
  template_content: string;

  @ApiPropertyOptional({ description: 'Template version', example: '1.0.0' })
  @IsString()
  @IsOptional()
  version?: string;

  @ApiPropertyOptional({
    description: 'Template variables',
    example: [
      {
        name: 'NODE_VERSION',
        description: 'Node.js version',
        type: 'string',
        default: '18',
        required: true,
      },
    ],
  })
  @IsArray()
  @IsOptional()
  variables?: Array<{
    name: string;
    description?: string;
    type?: string;
    default?: any;
    required?: boolean;
  }>;

  @ApiPropertyOptional({
    description: 'Template metadata',
    example: {
      tags: ['nodejs', 'microservices', 'docker'],
      author: 'DevOps Team',
      estimated_duration: 300,
    },
  })
  @IsObject()
  @IsOptional()
  metadata?: {
    tags?: string[];
    author?: string;
    estimated_duration?: number;
    complexity?: string;
    [key: string]: any;
  };

  @ApiPropertyOptional({ description: 'Is template published', default: false })
  @IsBoolean()
  @IsOptional()
  is_published?: boolean;

  @ApiPropertyOptional({ description: 'Is template verified', default: false })
  @IsBoolean()
  @IsOptional()
  is_verified?: boolean;

  @ApiPropertyOptional({ description: 'Project ID that created this template' })
  @IsUUID()
  @IsOptional()
  created_by_project_id?: string;
}
