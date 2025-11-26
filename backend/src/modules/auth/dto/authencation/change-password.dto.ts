import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches, IsOptional } from 'class-validator';

import { PASSWORD_REGEX } from '../../../../constants';
import { NotEqual } from '../../decorators/';

export class ChangePwdDto {
  @IsNotEmpty({
    message: 'USER::ID_IS_REQUIRED',
  })
  @ApiProperty()
  id: string;

  @ApiProperty({
    required: false,
    description: 'Current password. Required if not admin',
  })
  @IsOptional()
  password?: string;

  @ApiProperty()
  @IsNotEmpty({
    message: 'USER::PASSWORD_IS_REQUIRED',
  })
  @Matches(new RegExp(PASSWORD_REGEX, 'i'), {
    message: 'AUTH::PASSWORD_INVALID_FORMAT',
  })
  @NotEqual('password', {
    message: 'AUTH::PASSWORDS_MUST_DIFFERENCE',
  })
  newPassword: string;

  @ApiProperty({
    required: false,
    description: 'If true, all user sessions will be logged out',
    example: false,
  })
  @IsOptional()
  isLogout?: boolean;
}
