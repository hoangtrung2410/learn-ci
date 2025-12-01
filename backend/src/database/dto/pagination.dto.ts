import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class PaginationDto {
  @ApiProperty({ description: 'Limit for pagination', example: 10 })
  @IsOptional()
  limit?: number;

  @ApiProperty({ description: 'Offset for pagination', example: 0 })
  @IsOptional()
  offset?: number;
}
