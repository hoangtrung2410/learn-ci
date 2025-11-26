import {
  Controller,
  Body,
  Get,
  Query,
  Put,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser, RequiredPermissions } from '../auth/decorators';
import { EAction, EModule } from '../auth/constants/auth.enum';
import { QueryPaginationDto, usersDto } from '../../common';
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IJwtPayload } from '../auth/interfaces';

@Controller('users')
@ApiTags('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}
  @Get('deleted')
  @ApiOperation({
    summary: 'Get Deleted Users',
    description: 'Requires role Amin or Super Admin',
  })
  @ApiBearerAuth()
  @RequiredPermissions([{ action: EAction.VIEW_ALL, module: EModule.USER }])
  async getDeletedUsers(@Query() query: QueryPaginationDto) {
    console.log('xxxx', query.page);
    return this.usersService.getAllUserDelete(query);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update User',
    description: 'Requires role Amin or Super Admin',
  })
  @ApiBearerAuth()
  @RequiredPermissions([{ action: EAction.EDIT, module: EModule.USER }])
  updateProfile(
    @Param('id') id: string,
    @Body()
    payload: UpdateUserDto,
  ) {
    console.log(id);
    return this.usersService.updateProfile(id, payload);
  }

  @Get()
  @ApiOperation({
    summary: 'Get All Users',
    description: 'Requires role Amin or Super Admin',
  })
  @ApiBearerAuth()
  @RequiredPermissions([{ action: EAction.VIEW_ALL, module: EModule.USER }])
  async getAllUsers(@Query() query: usersDto) {
    return this.usersService.getAllUser(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get User Detail',
    description: 'Requires role Amin or Super Admin',
  })
  @ApiBearerAuth()
  @RequiredPermissions([{ action: EAction.VIEW_DETAIL, module: EModule.USER }])
  getProfile(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get('me/profile')
  @ApiOperation({
    summary: 'Get My Profile',
    description: 'Get profile of logged in user',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getMyProfile(@CurrentUser() user: IJwtPayload) {
    return this.usersService.findOneMe(user.id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete User',
    description: 'Requires role Amin or Super Admin',
  })
  @ApiBearerAuth()
  @RequiredPermissions([{ action: EAction.DELETE, module: EModule.USER }])
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Put('restore/:id')
  @ApiOperation({
    summary: 'Restore Deleted User',
    description: 'Requires role Amin or Super Admin',
  })
  @ApiBearerAuth()
  @RequiredPermissions([{ action: EAction.RESTORE, module: EModule.USER }])
  restoreUser(@Param('id') id: string) {
    return this.usersService.restoreUser(id);
  }
}
