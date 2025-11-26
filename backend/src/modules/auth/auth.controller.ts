import {
  Body,
  Controller,
  Post,
  UseGuards,
  HttpCode,
  Put,
  Delete,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { AuthenticationService } from './authentication.service';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser, RequiredPermissions } from './decorators';
import { QueryPaginationDto } from '../../common/dto/query-pagination.dto';
import { LoginDto } from './dto/authencation';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { IJwtPayload } from './interfaces';
import { EAction, EModule } from './constants/auth.enum';
import { ChangePwdDto } from './dto/authencation/change-password.dto';
import { CreateActionDto } from './dto/authorization/create-action.dto';
import { CreateRoleDto } from './dto/authorization/create-role.dto';
import { CreatePermissionDto } from './dto/authorization/create-permission.dto';
import { CreateModuleDto } from './dto/authorization/create-module.dto';
import { UpdateModuleDto } from './dto/authorization/update-module.dto';
import { UpdateActionDto } from './dto/authorization/update-action.dto';
import { UpdatePermissionDto } from './dto/authorization/update-permission.dto';
import { UpdateRoleDto } from './dto/authorization/update-role.dto';
import { AuthorizationService } from './authorization.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly authorizationService: AuthorizationService,
  ) {}




  // role, permission, aciton, module
  @ApiTags('role')
  @Post('create-role')
  @ApiOperation({
    summary: 'Create Role',
    description: 'This endpoint allows admin to create new role in the system',
  })
  @RequiredPermissions([{ action: EAction.CREATE, module: EModule.ROLE }])
  createRole(@Body() body: CreateRoleDto) {
    return this.authorizationService.createRole(body);
  }

  @ApiTags('module')
  @Post('create-module')
  @ApiOperation({
    summary: 'Create Module',
    description:
      'This endpoint allows admin to create new module in the system',
  })
  @RequiredPermissions([{ action: EAction.CREATE, module: EModule.MODULE }])
  createModule(@Body() body: CreateModuleDto) {
    return this.authorizationService.createModule(body);
  }

  @ApiTags('action')
  @Post('create-action')
  @ApiOperation({
    summary: 'Create Action',
    description:
      'This endpoint allows admin to create new action in the system',
  })
  @RequiredPermissions([{ action: EAction.CREATE, module: EModule.ACTION }])
  createAction(@Body() body: CreateActionDto) {
    return this.authorizationService.createAction(body);
  }

  @ApiTags('permission')
  @Post('create-permission')
  @ApiOperation({
    summary: 'Create Permission',
    description:
      'This endpoint allows admin to create new permission in the system',
  })
  @RequiredPermissions([{ action: EAction.CREATE, module: EModule.PERMISSION }])
  createPermission(@Body() body: CreatePermissionDto) {
    return this.authorizationService.createPermission(body);
  }

  @ApiTags('role')
  @Put('update-role')
  @ApiOperation({
    summary: 'Update Role',
    description: 'This endpoint allows admin to update role in the system',
  })
  @RequiredPermissions([{ action: EAction.EDIT, module: EModule.ROLE }])
  updateRole(@Param('id') id: string, @Body() body: UpdateRoleDto) {
    return this.authorizationService.updateRole(id, body);
  }

  @ApiTags('module')
  @Put('update-module')
  @ApiOperation({
    summary: 'Update Module',
    description: 'This endpoint allows admin to update module in the system',
  })
  @RequiredPermissions([{ action: EAction.EDIT, module: EModule.MODULE }])
  async updateModule(@Param('id') id: string, @Body() body: UpdateModuleDto) {
    return this.authorizationService.updateModule(id, body);
  }

  @ApiTags('action')
  @Put('update-action')
  @ApiOperation({
    summary: 'Update Action',
    description: 'This endpoint allows admin to update action in the system',
  })
  @RequiredPermissions([{ action: EAction.EDIT, module: EModule.ACTION }])
  async updateAction(@Param('id') id: string, @Body() body: UpdateActionDto) {
    return this.authorizationService.updateAction(id, body);
  }

  @ApiTags('permission')
  @Put('update-permission')
  @ApiOperation({
    summary: 'Update Permission',
    description:
      'This endpoint allows admin to update permission in the system',
  })
  @RequiredPermissions([{ action: EAction.EDIT, module: EModule.PERMISSION }])
  async updatePermission(
    @Param('id') id: string,
    @Body() body: UpdatePermissionDto,
  ) {
    return this.authorizationService.updatePermission(id, body);
  }

  @ApiTags('role')
  @Delete('delete-role/:id')
  @ApiOperation({
    summary: 'Delete Role',
    description: 'This endpoint allows admin to delete role in the system',
  })
  @RequiredPermissions([{ action: EAction.DELETE, module: EModule.ROLE }])
  async deleteRole(@Param('id') id: string) {
    return this.authorizationService.deleteRole(id);
  }

  @ApiTags('module')
  @Delete('delete-module/:id')
  @ApiOperation({
    summary: 'Delete Module',
    description: 'This endpoint allows admin to delete module in the system',
  })
  @RequiredPermissions([{ action: EAction.DELETE, module: EModule.MODULE }])
  async deleteModule(@Param('id') id: string) {
    return this.authorizationService.deleteModule(id);
  }

  @ApiTags('action')
  @Delete('delete-action/:id')
  @ApiOperation({
    summary: 'Delete Action',
    description: 'This endpoint allows admin to delete action in the system',
  })
  @RequiredPermissions([{ action: EAction.DELETE, module: EModule.ACTION }])
  async deleteAction(@Param('id') id: string) {
    return this.authorizationService.deleteAction(id);
  }

  @ApiTags('permission')
  @Delete('delete-permission/:id')
  @ApiOperation({
    summary: 'Delete Permission',
    description:
      'This endpoint allows admin to delete permission in the system',
  })
  @RequiredPermissions([{ action: EAction.DELETE, module: EModule.PERMISSION }])
  async deletePermission(@Param('id') id: string) {
    return this.authorizationService.deletePermission(id);
  }

  @ApiTags('role')
  @Get('roles')
  @ApiOperation({
    summary: 'Get All Roles',
    description: 'This endpoint allows admin to get all roles in the system',
  })
  @RequiredPermissions([{ action: EAction.VIEW_ALL, module: EModule.ROLE }])
  async getAllRoles(@Query() query: QueryPaginationDto) {
    return this.authorizationService.listRole(query);
  }

  @Get('modules')
  @ApiTags('module')
  @ApiOperation({
    summary: 'Get All Modules',
    description: 'This endpoint allows admin to get all modules in the system',
  })
  @RequiredPermissions([{ action: EAction.VIEW_ALL, module: EModule.MODULE }])
  async getAllModules(@Query() query: QueryPaginationDto) {
    return this.authorizationService.listModule(query);
  }

  @ApiTags('action')
  @Get('actions')
  @ApiOperation({
    summary: 'Get All Actions',
    description: 'This endpoint allows admin to get all actions in the system',
  })
  @RequiredPermissions([{ action: EAction.VIEW_ALL, module: EModule.ACTION }])
  async getAllActions(@Query() query: QueryPaginationDto) {
    return this.authorizationService.listAction(query);
  }

  @ApiTags('permission')
  @Get('permissions')
  @ApiOperation({
    summary: 'Get All Permissions',
    description:
      'This endpoint allows admin to get all permissions in the system',
  })
  @RequiredPermissions([
    { action: EAction.VIEW_ALL, module: EModule.PERMISSION },
  ])
  async getAllPermissions(@Query() query: QueryPaginationDto) {
    return this.authorizationService.listPermission(query);
  }

  @ApiTags('permission')
  @Get('permissions/:id')
  @ApiOperation({
    summary: 'Get Permission Detail',
    description:
      'This endpoint allows admin to get permission detail in the system',
  })
  @RequiredPermissions([
    { action: EAction.VIEW_DETAIL, module: EModule.PERMISSION },
  ])
  async getPermissionDetail(@Param('id') id: string) {
    return this.authorizationService.getPermissionById(id);
  }

  @ApiTags('role')
  @Get('roles/:id')
  @ApiOperation({
    summary: 'Get Role Detail',
    description: 'This endpoint allows admin to get role detail in the system',
  })
  @RequiredPermissions([{ action: EAction.VIEW_DETAIL, module: EModule.ROLE }])
  async getRoleDetail(@Param('id') id: string) {
    return this.authorizationService.getRole(id);
  }

  @ApiTags('module')
  @Get('modules/:id')
  @ApiOperation({
    summary: 'Get Module Detail',
    description:
      'This endpoint allows admin to get module detail in the system',
  })
  @RequiredPermissions([
    { action: EAction.VIEW_DETAIL, module: EModule.MODULE },
  ])
  async getModuleDetail(@Param('id') id: string) {
    return this.authorizationService.getModuleById(id);
  }

  @ApiTags('action')
  @Get('actions/:id')
  @ApiOperation({
    summary: 'Get Action Detail',
    description:
      'This endpoint allows admin to get action detail in the system',
  })
  @RequiredPermissions([
    { action: EAction.VIEW_DETAIL, module: EModule.ACTION },
  ])
  async getActionDetail(@Param('id') id: string) {
    return this.authorizationService.getActionById(id);
  }

    // 1. Frontend calls this to get the GitHub redirect URL
  @Get('github/url')
  getGithubUrl() {
    return { url: this.authenticationService.getGithubLoginUrl() };
  }

  // 2. Frontend sends the 'code' here after user approves
  @Post('github/callback')
  async githubCallback(@Body('code') code: string) {
    if (!code) {
      throw new Error('No code provided');
    }
    const user = await this.authenticationService.validateGithubLogin(code);
    return user;
  }
}
