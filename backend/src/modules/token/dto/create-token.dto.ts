import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateTokenDto {
  @ApiProperty({ description: 'Token ', example: 'abc' })
  @IsString({ message: 'TOKEN::NAME_MUST_BE_STRING' })
  @MaxLength(250, { message: 'TOKEN::MAX_LENGTH_IS_250' })
  name: string;

  @ApiProperty({
    description: 'Token associated email',
    example: 'abc12312312312',
  })
  @IsOptional()
  token?: string;
}
