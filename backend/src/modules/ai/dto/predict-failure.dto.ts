import { IsObject, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PredictFailureDto {
    @ApiPropertyOptional({ description: 'Branch name' })
    @IsString()
    @IsOptional()
    branch?: string;

    @ApiPropertyOptional({ description: 'Commit SHA' })
    @IsString()
    @IsOptional()
    commit_sha?: string;

    @ApiPropertyOptional({ description: 'Historical success rate' })
    @IsNumber()
    @IsOptional()
    historical_success_rate?: number;

    @ApiPropertyOptional({ description: 'Additional metadata' })
    @IsObject()
    @IsOptional()
    metadata?: any;
}
