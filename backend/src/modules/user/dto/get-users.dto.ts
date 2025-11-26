import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class GetUsersDto {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber({}, { message: 'NUMBER_MUST_BE_NUMBER' })
  page: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber({}, { message: 'NUMBER_MUST_BE_NUMBER' })
  limit: number;
}