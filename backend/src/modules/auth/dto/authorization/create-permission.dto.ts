import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ example: 'View User', description: 'Tên quyền' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'Cho phép xem thông tin người dùng',
    description: 'Mô tả quyền',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example: ['1212', '121212'],
    description: 'Danh sách ID role được gán quyền này',
  })
  @IsOptional()
  roles?: string[];

  @ApiProperty({ example: '1212', description: 'ID action gắn với permission' })
  @IsNotEmpty()
  actionId: string;

  @ApiProperty({
    example: '12121',
    description: 'ID module gắn với permission',
  })
  @IsNotEmpty()
  moduleId: string;

  @ApiProperty({
    description: 'The deletion date of the user',
    example: null,
    required: false,
  })
  @IsOptional()
  deletedAt?: Date;
}
