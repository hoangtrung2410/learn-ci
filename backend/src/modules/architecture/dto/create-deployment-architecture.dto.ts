import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a new deployment architecture
 */
export class CreateDeploymentArchitectureDto {
  @ApiProperty({
    description: 'Architecture name',
    example: 'Microservices Architecture',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Architecture key', example: 'microservices' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  key: string;

  @ApiPropertyOptional({ description: 'Architecture description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Architecture metadata with pros, cons, best use cases',
    example: {
      pros: ['Scalability', 'Independent deployment', 'Technology diversity'],
      cons: [
        'Complexity',
        'Distributed system challenges',
        'Higher operational overhead',
      ],
      best_for: [
        'Large teams',
        'Complex applications',
        'High scalability requirements',
      ],
      complexity: 'high',
      scalability: 'excellent',
      maintenance: 'moderate',
    },
  })
  @IsObject()
  @IsOptional()
  metadata?: {
    pros?: string[];
    cons?: string[];
    best_for?: string[];
    complexity?: string;
    scalability?: string;
    maintenance?: string;
    [key: string]: any;
  };
}
