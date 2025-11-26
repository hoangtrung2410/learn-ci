import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { CreatePermissionDto } from './dto/authorization/create-permission.dto';
import { Like } from 'typeorm';
import { In } from 'typeorm';
import { Console } from 'nestjs-console';
import { CreateRoleDto, UpdateRoleDto } from './dto/authorization';
import { PermissionEntity, RoleEntity } from './entities';
import { AuthFactoryHelper } from './helpers/auth-factory.helper';
import { CreateModuleDto } from './dto/authorization/create-module.dto';
import { UpdateModuleDto } from './dto/authorization/update-module.dto';
import { ModuleEntity } from './entities/module.entity';
import { ActionEntity } from './entities/action.entity';
import { CreateActionDto } from './dto/authorization/create-action.dto';
import { UpdateActionDto } from './dto/authorization/update-action.dto';
import { UpdatePermissionDto } from './dto/authorization/update-permission.dto';
import { QueryPaginationDto } from '../../common/dto/query-pagination.dto';
import * as jwt from 'jsonwebtoken';

import {
  ActionRepository,
  ModuleRepository,
  PermissionRepository,
  RoleRepository,
} from './repositories';
import { Environment } from '../../constants';
import { IResponseMessage } from '../../interfaces';
import { UserService } from '../user/user.service';
import { UserFactoryHelper } from '../user/helpers/user-factory.helper';
import { IHasPermission } from './interfaces';

@Console()
@Injectable()
export class AuthorizationService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AuthorizationService.name);
  constructor(
    private readonly discover: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly configService: ConfigService,
    private readonly authFactory: AuthFactoryHelper,
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
    private readonly moduleRepository: ModuleRepository,
    private readonly actionRepository: ActionRepository,
    private readonly factory: UserFactoryHelper,
    @Inject(forwardRef(() => UserService))
    private readonly usersService: UserService,
  ) {}

  async onApplicationBootstrap() {
    if (this.configService.get<string>('environment') === Environment.local) {
      await this._genSuperAdminRole({ name: 'SuperAdmin' });
    }
  }

  async getRole(roleId: string) {
    try {
      const role = await this.roleRepository.findOne({
        where: {
          id: roleId,
        },
        relations: ['users', 'permissions'],
      });
      if (!role) throw new BadRequestException('AUTH::INVALID_ROLE');
      return role;
    } catch (error) {
      this.logger.error(error?.stack);
      throw new BadRequestException('AUTH::INVALID_ROLE');
    }
  }
  // role
  async createRole(createRoleDto: CreateRoleDto) {
    try {
      const permissionsIds = createRoleDto.permissions || [];
      let permissionsEntities: PermissionEntity[] = [];

      if (permissionsIds.length > 0) {
        permissionsEntities = await this.permissionRepository.find({
          where: { id: In(permissionsIds), deletedAt: null },
        });

        if (permissionsEntities.length !== permissionsIds.length) {
          throw new BadRequestException('AUTH::SOME_PERMISSIONS_NOT_FOUND');
        }
      }

      const existingRole = await this.roleRepository.findOne({
        where: { name: createRoleDto.name, deletedAt: null },
      });

      if (existingRole) {
        throw new BadRequestException('AUTH::ROLE_NAME_ALREADY_EXISTS');
      }

      const roleEntity = this.roleRepository.create({
        ...createRoleDto,
        permissions: permissionsEntities, // <-- dùng entity array
      });

      return await this.roleRepository.save(roleEntity);
    } catch (error) {
      this.logger.error('CREATE_ROLE_ERROR:', error);
      throw new BadRequestException('AUTH::CREATE_ROLE_FAILED');
    }
  }

  async updateRole(roleId: string, updateRoleDto: UpdateRoleDto) {
    try {
      const role = await this.getRole(roleId);
      if (role.isDefault) {
        throw new BadRequestException('AUTH::CANNOT_MODIFY_DEFAULT_ROLE');
      }
      Object.assign(role, updateRoleDto);
      return this.roleRepository.save(role);
    } catch (error) {
      this.logger.error(error?.stack);
      throw new BadRequestException('AUTH::UPDATE_ROLE_FAILED' + error.message);
    }
  }

  async deleteRole(roleId: string): Promise<IResponseMessage> {
    try {
      const role = await this.getRole(roleId);
      if (role.isDefault) {
        throw new BadRequestException('AUTH::CANNOT_MODIFY_DEFAULT_ROLE');
      }
      await this.roleRepository.update(
        { id: roleId },
        { deletedAt: new Date() },
      );

      return this.factory.resFactory('AUTH::DELETE_ROLE_SUCCESS');
    } catch (error) {
      this.logger.error(error?.stack);
      throw new BadRequestException('AUTH::DELETE_ROLE_FAILED' + error.message);
    }
  }

  async listRole(query: QueryPaginationDto): Promise<{
    items: RoleEntity[];
    paging: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }> {
    try {
      const { page, limit, keyword } = query;

      const [data, totalItems] = await this.roleRepository.findAndCount({
        where: keyword
          ? { name: Like(`%${keyword}%`), deletedAt: null }
          : { deletedAt: null },
        relations: ['permissions', 'users'],
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

      const totalPages = Math.ceil(totalItems / limit);

      return {
        items: data,
        paging: {
          totalItems,
          itemCount: data.length,
          itemsPerPage: limit, // ✅ chỗ này
          totalPages,
          currentPage: page,
        },
      };
    } catch (error) {
      this.logger.error(error?.stack);
      throw new BadRequestException('AUTH::LIST_ROLE_FAILED' + error.message);
    }
  }

  async createPermission(data: CreatePermissionDto): Promise<PermissionEntity> {
    try {
      const { roles: roleIds, actionId, moduleId, ...rest } = data;
      const action = await this.actionRepository.findOne({
        where: { id: actionId, deletedAt: null },
      });
      if (!action) {
        throw new BadRequestException('AUTH::INVALID_ACTION');
      }
      const module = await this.moduleRepository.findOne({
        where: { id: moduleId, deletedAt: null },
      });
      if (!module) {
        throw new BadRequestException('AUTH::INVALID_MODULE');
      }
      const code = `${module.code}::${action.code}`;
      const existingPermission = await this.permissionRepository.findOne({
        where: { code, deletedAt: null },
      });

      if (existingPermission) {
        throw new BadRequestException('AUTH::PERMISSION_CODE_ALREADY_EXISTS');
      }
      const permission = this.permissionRepository.create({
        ...rest,
        code: code,
        action: { id: actionId },
        module: { id: moduleId },
      } as unknown as PermissionEntity);

      if (roleIds && roleIds.length > 0) {
        const roles = await this.roleRepository.find({
          where: { id: In(roleIds), deletedAt: null },
        });

        if (roles.length !== roleIds.length) {
          throw new BadRequestException('AUTH::SOME_ROLES_NOT_FOUND');
        }
        permission.roles = roles;
      }
      return this.permissionRepository.save(permission);
    } catch (error) {
      this.logger.error(error?.stack);
      throw new BadRequestException(
        'AUTH::CREATE_PERMISSION_FAILED' + error.message,
      );
    }
  }

  async deletePermission(permissionId: string) {
    try {
      const permission = await this.permissionRepository.findOne({
        where: { id: permissionId, deletedAt: null },
      });

      if (!permission) {
        throw new BadRequestException('AUTH::INVALID_PERMISSION');
      }

      await this.permissionRepository.update(
        { id: permissionId },
        { deletedAt: new Date() },
      );
      return {
        message: 'AUTH::DELETE_PERMISSION_SUCCESS',
      };
    } catch (error) {
      this.logger.error(error?.stack);
      throw new BadRequestException('AUTH::INVALID_PERMISSION');
    }
  }

  async listPermission(query: QueryPaginationDto): Promise<{
    items: PermissionEntity[];
    paging: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }> {
    try {
      const { page, limit, keyword } = query;

      const [data, totalItems] = await this.permissionRepository.findAndCount({
        where: keyword
          ? { name: Like(`%${keyword}%`), deletedAt: null }
          : { deletedAt: null },
        relations: ['module', 'action', 'roles'],
        order: {
          module: {
            name: 'ASC',
          },
          action: {
            name: 'ASC',
          },
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      const totalPages = Math.ceil(totalItems / limit);

      return {
        items: data,
        paging: {
          totalItems,
          itemCount: data.length,
          itemsPerPage: limit,
          totalPages,
          currentPage: page,
        },
      };
    } catch (error) {
      this.logger.error(error?.stack);
      throw new BadRequestException(
        'AUTH::LIST_PERMISSION_FAILED' + error.message,
      );
    }
  }

  async getPermissionById(id: string): Promise<PermissionEntity> {
    try {
      const permission = await this.permissionRepository.findOne({
        where: { id, deletedAt: null },
        relations: ['module', 'action', 'roles'],
      });

      if (!permission) {
        throw new BadRequestException('AUTH::INVALID_PERMISSION');
      }

      return permission;
    } catch (error) {
      this.logger.error(error?.stack);
      throw new BadRequestException('AUTH::INVALID_PERMISSION' + error.message);
    }
  }

  async updatePermission(id: string, data: UpdatePermissionDto) {
    try {
      const permission = await this.getPermissionById(id);
      if (!permission) {
        throw new BadRequestException('AUTH::PERMISSION_NOT_FOUND');
      }

      const { roles: roleIds, actionId, moduleId, ...rest } = data;

      const action = await this.actionRepository.findOne({
        where: { id: actionId, deletedAt: null },
      });
      console.log(action);
      if (!action) {
        throw new BadRequestException('AUTH::INVALID_ACTION');
      }
      // Kiểm tra module
      const module = await this.moduleRepository.findOne({
        where: { id: moduleId, deletedAt: null },
      });
      if (!module) {
        throw new BadRequestException('AUTH::INVALID_MODULE');
      }

      // Tạo code mới
      const code = `${module.code}::${action.code}`;

      // Check trùng code nhưng bỏ qua chính permission hiện tại
      const existingPermission = await this.permissionRepository.findOne({
        where: { code, deletedAt: null },
      });

      if (existingPermission && existingPermission.id !== permission.id) {
        throw new BadRequestException('AUTH::PERMISSION_CODE_ALREADY_EXISTS');
      }

      // Update thông tin
      permission.code = code;
      permission.action = action;
      permission.module = module;
      Object.assign(permission, rest);

      // Update roles nếu có
      if (roleIds && roleIds.length > 0) {
        const roles = await this.roleRepository.find({
          where: { id: In(roleIds), deletedAt: null },
        });

        if (roles.length !== roleIds.length) {
          throw new BadRequestException('AUTH::SOME_ROLES_NOT_FOUND');
        }
        permission.roles = roles;
      } else {
        permission.roles = [];
      }

      return this.permissionRepository.save(permission);
    } catch (error) {
      this.logger.error(error?.stack);
      throw new BadRequestException(
        'AUTH::UPDATE_PERMISSION_FAILED' + error.message,
      );
    }
  }

  async listModule(query: QueryPaginationDto): Promise<{
    items: ModuleEntity[];
    paging: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }> {
    try {
      const { page, limit, keyword } = query;

      const [data, totalItems] = await this.moduleRepository.findAndCount({
        where: keyword
          ? { name: Like(`%${keyword}%`), deletedAt: null }
          : { deletedAt: null },
        order: { name: 'ASC' },
        skip: (page - 1) * limit,
        take: limit,
      });

      const totalPages = Math.ceil(totalItems / limit);

      return {
        items: data,
        paging: {
          totalItems,
          itemCount: data.length,
          itemsPerPage: limit,
          totalPages,
          currentPage: page,
        },
      };
    } catch (error) {
      this.logger.error(error?.stack);
      throw new BadRequestException('AUTH::LIST_MODULE_FAILED' + error.message);
    }
  }

  async getModuleById(id: string) {
    try {
      const module = await this.moduleRepository.findOne({
        where: { id, deletedAt: null },
      });
      if (!module) throw new BadRequestException('AUTH::INVALID_MODULE');
      return module;
    } catch (error) {
      this.logger.error(error?.stack);
      throw new BadRequestException('AUTH::INVALID_MODULE' + error.message);
    }
  }

  async createModule(data: CreateModuleDto): Promise<ModuleEntity> {
    try {
      const existingModule = await this.moduleRepository.findOne({
        where: { name: data.name, deletedAt: null },
      });
      if (existingModule) {
        throw new BadRequestException('AUTH::MODULE_NAME_ALREADY_EXISTS');
      }
      const module = this.moduleRepository.create(
        data as unknown as ModuleEntity,
      );
      return this.moduleRepository.save(module);
    } catch (error) {
      this.logger.error(error?.stack);
      throw new BadRequestException(
        'AUTH::CREATE_MODULE_FAILED' + error.message,
      );
    }
  }

  async updateModule(id: string, data: UpdateModuleDto) {
    try {
      const module = await this.getModuleById(id);
      if (data.name && data.name !== module.name) {
        const existingModule = await this.moduleRepository.findOne({
          where: { name: data.name, deletedAt: null },
        });
        if (existingModule) {
          throw new BadRequestException('AUTH::MODULE_NAME_ALREADY_EXISTS');
        }
      }
      if (data.code && data.code !== module.code) {
        const permissions = await this.permissionRepository.find({
          where: { module: { id: module.id }, deletedAt: null },
          relations: ['module'],
        });
        for (const permission of permissions) {
          const newCode = permission.code.replace(
            `${module.code}::`,
            `${data.code}::`,
          );
          const existingPermission = await this.permissionRepository.findOne({
            where: { code: newCode, deletedAt: null },
          });
          if (existingPermission) {
            throw new BadRequestException(
              'AUTH::PERMISSION_CODE_ALREADY_EXISTS',
            );
          }
          permission.code = newCode;
          await this.permissionRepository.save(permission);
        }
      }
      Object.assign(module, data);
      return this.moduleRepository.save(module);
    } catch (error) {
      this.logger.error(error?.stack);
      throw new BadRequestException(
        'AUTH::UPDATE_MODULE_FAILED' + error.message,
      );
    }
  }

  async deleteModule(id: string) {
    try {
      const module = await this.getModuleById(id);
      const linkedPermissions = await this.permissionRepository.find({
        where: { module: { id: module.id }, deletedAt: null },
      });
      if (linkedPermissions.length > 0) {
        throw new BadRequestException(
          'AUTH::CANNOT_DELETE_MODULE_WITH_LINKED_PERMISSIONS',
        );
      }
      await this.moduleRepository.update({ id }, { deletedAt: new Date() });
      return this.factory.resFactory('AUTH::DELETE_MODULE_SUCCESS');
    } catch (error) {
      this.logger.error(error?.stack);
      throw new BadRequestException(
        'AUTH::DELETE_MODULE_FAILED' + error.message,
      );
    }
  }

  async listAction(query: QueryPaginationDto): Promise<{
    items: ActionEntity[];
    paging: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }> {
    try {
      const { page, limit, keyword } = query;

      const [data, totalItems] = await this.actionRepository.findAndCount({
        where: keyword
          ? { name: Like(`%${keyword}%`), deletedAt: null }
          : { deletedAt: null },
        order: { name: 'ASC' },
        skip: (page - 1) * limit,
        take: limit,
      });

      const totalPages = Math.ceil(totalItems / limit);

      return {
        items: data,
        paging: {
          totalItems,
          itemCount: data.length,
          itemsPerPage: limit,
          totalPages,
          currentPage: page,
        },
      };
    } catch (error) {
      this.logger.error(error?.stack);
      throw new BadRequestException('AUTH::LIST_ACTION_FAILED' + error.message);
    }
  }

  async getActionById(id: string) {
    try {
      const action = await this.actionRepository.findOne({
        where: { id, deletedAt: null },
      });
      if (!action) throw new BadRequestException('AUTH::INVALID_ACTION');
      return action;
    } catch (error) {
      this.logger.error(error?.stack);
      throw new BadRequestException('AUTH::INVALID_ACTION' + error.message);
    }
  }

  async createAction(data: CreateActionDto) {
    try {
      const existingAction = await this.actionRepository.findOne({
        where: { name: data.name, deletedAt: null },
      });
      if (existingAction) {
        throw new BadRequestException('AUTH::ACTION_NAME_ALREADY_EXISTS');
      }
      const action = this.actionRepository.create(
        data as unknown as ActionEntity,
      );
      return this.actionRepository.save(action);
    } catch (error) {
      this.logger.error(error?.stack);
      throw new BadRequestException(
        'AUTH::CREATE_ACTION_FAILED' + error.message,
      );
    }
  }

  async updateAction(id: string, data: UpdateActionDto) {
    try {
      const action = await this.getActionById(id);
      if (data.name && data.name !== action.name) {
        const existingAction = await this.actionRepository.findOne({
          where: { name: data.name, deletedAt: null },
        });
        if (existingAction) {
          throw new BadRequestException('AUTH::ACTION_NAME_ALREADY_EXISTS');
        }
      }
      if (data.code && data.code !== action.code) {
        const permissions = await this.permissionRepository.find({
          where: { action: { id: action.id }, deletedAt: null },
          relations: ['action'],
        });
        for (const permission of permissions) {
          const newCode = permission.code.replace(
            `::${action.code}`,
            `::${data.code}`,
          );
          const existingPermission = await this.permissionRepository.findOne({
            where: { code: newCode, deletedAt: null },
          });
          if (existingPermission) {
            throw new BadRequestException(
              'AUTH::PERMISSION_CODE_ALREADY_EXISTS',
            );
          }
          permission.code = newCode;
          await this.permissionRepository.save(permission);
        }
      }
      Object.assign(action, data);
      return this.actionRepository.save(action);
    } catch (error) {
      this.logger.error(error?.stack);
      throw new BadRequestException(
        'AUTH::UPDATE_ACTION_FAILED' + error.message,
      );
    }
  }

  async deleteAction(id: string) {
    try {
      const action = await this.getActionById(id);
      const linkedPermissions = await this.permissionRepository.find({
        where: { action: { id: action.id }, deletedAt: null },
      });
      if (linkedPermissions.length > 0) {
        throw new BadRequestException(
          'AUTH::CANNOT_DELETE_ACTION_WITH_LINKED_PERMISSIONS',
        );
      }
      await this.actionRepository.update({ id }, { deletedAt: new Date() });
      return this.factory.resFactory('AUTH::DELETE_ACTION_SUCCESS');
    } catch (error) {
      this.logger.error(error?.stack);
      throw new BadRequestException(
        'AUTH::DELETE_ACTION_FAILED' + error.message,
      );
    }
  }

  async hasPermission(payload: IHasPermission): Promise<boolean> {
    try {
      const user = await this.usersService.findOne(payload.userId);
      if (!user) throw new BadRequestException('AUTH::USER_NOT_FOUND');
      const masterPms = this._getMasterPermissions(payload.permissionCodes);
      const permissionCodesMatch =
        await this.roleRepository.getUserMatchPermission(payload.userId, [
          ...payload.permissionCodes,
          ...masterPms,
        ]);
      return permissionCodesMatch.length > 0;
    } catch (error) {
      this.logger.error(error?.stack);
      throw new BadRequestException(
        'AUTH::CHECK_PERMISSION_FAILED' + error.message,
      );
    }
  }

  _getMasterPermissions(permissionCodes: string[]): string[] {
    const masterPermissionCodes: Set<string> = new Set(['*::*']);

    permissionCodes.forEach((permissionCode) => {
      masterPermissionCodes.add(`${permissionCode.split('::')[0]}::*`);
    });

    return Array.from(masterPermissionCodes);
  }

  private async _genSuperAdminRole(input): Promise<void> {
    try {
      console.time('Total run time: ');

      // 1. Kiểm tra hoặc tạo permission *::*
      let superAdminPms = await this.permissionRepository.findOne({
        where: { code: '*::*', deletedAt: null },
        relations: ['roles', 'roles.users'],
      });

      if (!superAdminPms) {
        superAdminPms = await this.permissionRepository.save(
          this.permissionRepository.create({
            name: 'All Permission',
            code: '*::*',
            description: 'Full permission for super admin',
          }),
        );
        console.log('Created new *::* permission.');
      }

      // 2. Kiểm tra hoặc tạo role Super Admin
      let role = superAdminPms.roles?.find((r) => !r.deletedAt);
      if (!role) {
        role = await this.roleRepository.save(
          this.roleRepository.create({
            name: input.name || 'SuperAdmin',
            description: 'Super admin role with full system permissions.',
            isDefault: false,
            permissions: [superAdminPms],
          }),
        );
        console.log('Created new Super Admin role.');
      } else {
        console.log('Super Admin role already exists.');
      }

      // 3. Kiểm tra hoặc tạo user Super Admin
      const hasUser = role.users?.length > 0;
      if (!hasUser) {
        const email = 'admin1@admin.com';
        const password = 'Admin@123';

        await this.usersService.create({
          name: 'SuperAdmin1',
          roleId: role.id,
          email,
          password,
        });

        console.log(
          `.=========================================================.`,
        );
        console.log(
          `|     Successfully generate super admin for the system.   |`,
        );

        console.log(`|     Super admin name: ${input.name}                  |`);
        console.log(`|     Super admin email: ${email}                  |`);
        console.log(`|     Super admin password: ${password}             |`);
        console.log(
          `.=========================================================.`,
        );
      } else {
        console.log('Super Admin user already exists. Skipping user creation.');
        console.log(`|     Super admin name: ${input.name}                  |`);
        console.log(
          `|     Super admin email: admin@admin.com                |`,
        );
        console.log(`|     Super admin password: Admin@123          |`);
      }
      console.timeEnd('Total run time: ');
    } catch (error) {
      this.logger.error(error?.stack);
      throw new BadRequestException(
        'AUTH::GEN_SUPER_ADMIN_FAILED' + error.message,
      );
    }
  }

  async verifyAccess(accessToken, permission) {
    try {
      const publicKeyBase64 = this.configService.get<string>(
        'JWT_PUBLIC_KEY_BASE64',
      );
      if (!publicKeyBase64) return false;
      const publicKey = Buffer.from(publicKeyBase64, 'base64').toString('utf8');
      const payload = jwt.verify(accessToken, publicKey, {
        algorithms: ['RS256'],
      }) as any;
      if (!payload?.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }
      const hasPms = await this.hasPermission({
        userId: payload.sub,
        permissionCodes: permission,
      });
      if (hasPms) {
        return payload;
      } else {
        return {
          success: false,
          message: 'FORBIDDEN_RESOURCE',
          data: null,
        };
      }
    } catch (error) {
      this.logger.error(error?.stack);
      return {
        success: false,
        message: 'INVALID_TOKEN',
        data: null,
      };
    }
  }
}
