import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateActionDto {
  @ApiProperty({ example: 'View User', description: 'Tên action' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'VIEW_USER',
    description: 'Mã code duy nhất của action',
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
