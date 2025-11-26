import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryPaginationDto {
  @ApiProperty({
    type: Number,
    required: true,
    description: 'Default page 1. Min is 1',
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'COMMON::PAGE_MUST_BE_NUMBER' })
  @Min(1, { message: 'COMMON::MIN_PAGE' })
  page: number;

  @ApiProperty({
    type: Number,
    required: true,
    description: 'Default limit 10 rows. Min is 1 and max is 100',
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'COMMON::LIMIT_PER_PAGE_MUST_BE_NUMBER' })
  @Min(1, { message: 'COMMON::LIMIT_PER_PAGE_MIN' })
  @Max(100, { message: 'COMMON::LIMIT_PER_PAGE_MAX' })
  limit: number;

  @ApiProperty({
    type: String,
    required: false,
    description: 'Keyword for searching',
  })
  @IsOptional()
  keyword?: string;
}

export class usersDto extends QueryPaginationDto {
  
  @ApiProperty({
    type: String,
    required: false,
    description: 'Role ID for filtering users by role',
    example: "xxxxxxxxx",
  })
  @Type(() => String)
  @IsOptional()
  roleId: string;
}
