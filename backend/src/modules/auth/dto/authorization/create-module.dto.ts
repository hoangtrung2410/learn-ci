import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateModuleDto {
  @ApiProperty({ example: 'User Management', description: 'Tên module' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'USER_MODULE',
    description: 'Mã code duy nhất của module',
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    description: 'The deletion date of the user',
    example: null,
    required: false,
  })
  @IsOptional()
  deletedAt?: Date;
}
