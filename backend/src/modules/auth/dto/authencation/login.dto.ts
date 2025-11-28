import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'SuperAdmin',
    description: 'Username or email of the user',
  })
  @IsString({ message: 'AUTH::EMAIL_MUST_BE_STRING' })
  email: string;

  @ApiProperty({
    example: 'Admin@123',
    description: 'User password for authentication',
  })
  @IsString({ message: 'AUTH::PASSWORD_MUST_BE_STRING' })
  password: string;
}
