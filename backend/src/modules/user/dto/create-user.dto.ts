import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MaxLength,
  IsUUID,
  Matches,
  IsEmail,
} from 'class-validator';
import { PASSWORD_REGEX, PHONE } from '../../../constants';

export class CreateUserDto {
  @ApiProperty({ description: 'The name of the user', example: 'abc' })
  @IsString({ message: 'USER::NAME_MUST_BE_STRING' })
  @MaxLength(250, { message: 'AUTH::MAX_LENGTH_IS_250' })
  name: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'example@domain.com',
  })
  @IsEmail({}, { message: 'USER::EMAIL_INVALID' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'Abc123!@#',
  })
  @IsString({ message: 'USER::PASSWORD_MUST_BE_STRING' })
  @Matches(new RegExp(PASSWORD_REGEX, 'i'), {
    message: 'AUTH::PASSWORD_INVALID_FORMAT',
  })
  password: string;

}
