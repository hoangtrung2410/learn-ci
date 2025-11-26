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
    description: 'The full name of the user',
    example: 'John Doe',
  })
  @IsString({ message: 'USER::FULL_NAME_MUST_BE_STRING' })
  @MaxLength(250, { message: 'AUTH::MAX_LENGTH_IS_250' })
  @IsOptional()
  fullName?: string;

  @ApiProperty({
    description: 'The phone number of the user',
    example: '0869168279',
  })
  @IsString({ message: 'USER::PHONE_MUST_BE_STRING' })
  @IsOptional()
  @Matches(PHONE, { message: 'USER::PHONE_INVALID_FORMAT' })
  phone?: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'example@domain.com',
  })
  @IsEmail({}, { message: 'USER::EMAIL_INVALID' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'The role ID of the user',
    example: '8ce27269-5532-4ca6-952b-ad9398d48b34',
  })
  @IsString({ message: 'USER::ROLE_IS_INVALID' })
  @IsOptional()
  @IsUUID('all', { message: 'USER::ROLE_IS_INVALID' })
  roleId?: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'Abc123!@#',
  })
  @IsString({ message: 'USER::PASSWORD_MUST_BE_STRING' })
  @Matches(new RegExp(PASSWORD_REGEX, 'i'), {
    message: 'AUTH::PASSWORD_INVALID_FORMAT',
  })
  password: string;

  @ApiProperty({
    description: 'The deletion date of the user',
    example: null,
    required: false,
  })
  @IsOptional()
  deletedAt?: Date;

  @ApiProperty({
    description: 'Indicates if the user is active',
    example: true,
    required: false,
  })
  @IsOptional()
  isActive?: boolean;
}
