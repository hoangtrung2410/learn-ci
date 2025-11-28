import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';


export class RegisterDto {

  @ApiProperty()
  @IsString({ message: 'AUTH::NAME_MUST_BE_STRING' })
  name: string;

  @ApiProperty()
  @IsString({ message: 'AUTH::EMAIL_MUST_BE_STRING' })
  email: string;

  @ApiProperty()
  @IsString({ message: 'AUTH::PASSWORD_MUST_BE_STRING' })
  password: string;


}
