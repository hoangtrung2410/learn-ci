import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { RoleEntity } from '../../modules/auth/entities/role.entity';
import { ModuleEntity } from '../../modules/auth/entities/module.entity';
import { PermissionEntity } from '../../modules/auth/entities/permission.entity';
import { ActionEntity } from '../../modules/auth/entities/action.entity';
import { ROLE, EAction, EModule } from '../../modules/auth/constants/auth.enum';

export default class AuthSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const roleRepo = dataSource.getRepository(RoleEntity);
    const moduleRepo = dataSource.getRepository(ModuleEntity);
    const actionRepo = dataSource.getRepository(ActionEntity);
    const permissionRepo = dataSource.getRepository(PermissionEntity);

    // --- Seed Roles ---
    const roles = await roleRepo.save([
      { name: ROLE.SUPPER_ADMIN, description: 'Quản trị hệ thống' },
      { name: ROLE.ADMIN_CONFIGURATOR, description: 'Quản trị cấu hình' },
      { name: ROLE.USER_MANAGEMENT, description: 'Quản trị người dùng' },
      { name: ROLE.ADMIN_ANALYST, description: 'Quản trị phân tích' },
    ]);

    // --- Seed Modules ---
    const modules = await moduleRepo.save(
      Object.values(EModule).map((m) => ({ name: m, code: m })),
    );

    // --- Seed Actions ---
    const actions = await actionRepo.save(
      Object.values(EAction).map((a) => ({ name: a, code: a })),
    );

    // --- Build Permission Map ---
    // --- Build Permission Map ---
    const rolePermissionMap: Record<
      ROLE,
      Partial<Record<EModule, EAction[]>>
    > = {
      [ROLE.ADMIN_CONFIGURATOR]: {
        [EModule.CYCLE]: [
          EAction.CREATE,
          EAction.EDIT,
          EAction.DELETE,
          EAction.PURGE,
          EAction.VIEW_DETAIL,
          EAction.VIEW_ALL,
          EAction.START,
          EAction.STOP,
          EAction.TRIGGER,
        ],
        [EModule.SERVER]: [
          EAction.CREATE,
          EAction.EDIT,
          EAction.DELETE,
          EAction.VIEW_DETAIL,
          EAction.VIEW_ALL,
          EAction.TEST_CONNECTION,
        ],
        [EModule.THRESHOLD]: [
          EAction.CREATE,
          EAction.EDIT,
          EAction.DELETE,
          EAction.VIEW_DETAIL,
          EAction.VIEW_ALL,
        ],
      },
      [ROLE.USER_MANAGEMENT]: {
        [EModule.ROLE]: [
          EAction.VIEW_ALL,
          EAction.VIEW_DETAIL,
          EAction.CREATE,
          EAction.EDIT,
          EAction.DELETE,
          EAction.EXPORT,
          EAction.IMPORT,
        ],
        [EModule.MODULE]: [
          EAction.VIEW_ALL,
          EAction.VIEW_DETAIL,
          EAction.CREATE,
          EAction.EDIT,
          EAction.DELETE,
          EAction.EXPORT,
          EAction.IMPORT,
        ],
        [EModule.PERMISSION]: [
          EAction.VIEW_ALL,
          EAction.VIEW_DETAIL,
          EAction.CREATE,
          EAction.EDIT,
          EAction.DELETE,
          EAction.EXPORT,
          EAction.IMPORT,
        ],
        [EModule.ACTION]: [
          EAction.VIEW_ALL,
          EAction.VIEW_DETAIL,
          EAction.CREATE,
          EAction.EDIT,
          EAction.DELETE,
          EAction.EXPORT,
          EAction.IMPORT,
        ],
        [EModule.USER]: [
          EAction.VIEW_ALL,
          EAction.VIEW_DETAIL,
          EAction.CREATE,
          EAction.EDIT,
          EAction.DELETE,
          EAction.EXPORT,
          EAction.IMPORT,
        ],
        [EModule.AUTH]: [
          EAction.VIEW_ALL,
          EAction.VIEW_DETAIL,
          EAction.CREATE,
          EAction.EDIT,
          EAction.DELETE,
          EAction.EXPORT,
          EAction.IMPORT,
        ],
      },
      [ROLE.ADMIN_ANALYST]: {
        [EModule.EXPORT]: [EAction.EXPORT],
        [EModule.REPORT]: [
          EAction.REVENUE_REPORT,
          EAction.FILE_REPORT,
          EAction.VIEW_ALL,
        ],
        [EModule.SCHEDULER]: [EAction.CREATE, EAction.STOP, EAction.VIEW_ALL],
        [EModule.SEND_EMAIL]: [EAction.SEND_EMAIL],
        [EModule.SUBSCRIBER_QUOTA]: [EAction.VIEW_ALL],
        [EModule.FILE_LOG]: [
          EAction.PAUSE,
          EAction.CANCEL,
          EAction.RESUME,
          EAction.VIEW_ALL,
          EAction.VIEW_DETAIL,
        ],
        [EModule.QUOTA]: [EAction.READ_ALL],
      },
      [ROLE.SUPPER_ADMIN]: {
        // Supper Admin sẽ được cấp quyền đầy đủ sau
      }, // Supper Admin sẽ được cấp quyền đầy đủ sau
    };

    // --- Seed Permissions ---
    const permissions: PermissionEntity[] = [];

    // SUPPER_ADMIN: full quyền
    const supperAdminRole = roles.find((r) => r.name === ROLE.SUPPER_ADMIN);
    const allModule = modules.find((m) => m.code === EModule.ALL_MODULE);
    const allAction = actions.find((a) => a.code === EAction.ALL_ACTION);
    if (supperAdminRole && allModule && allAction) {
      permissions.push(
        permissionRepo.create({
          name: `${allAction.name}_${allModule.name}`,
          code: `${allModule.code}::${allAction.code}`,
          description: `Quyền full access cho Supper Admin`,
          action: allAction,
          module: allModule,
          roles: [supperAdminRole],
        }),
      );
    }

    // Các role khác
    for (const [roleName, moduleActions] of Object.entries(rolePermissionMap)) {
      const role = roles.find((r) => r.name === roleName);
      if (!role) continue;

      for (const [moduleCode, actionCodes] of Object.entries(moduleActions)) {
        const module = modules.find((m) => m.code === moduleCode);
        if (!module) continue;

        for (const actionCode of actionCodes) {
          const action = actions.find((a) => a.code === actionCode);
          if (!action) continue;

          permissions.push(
            permissionRepo.create({
              name: `${action.name}_${module.name}`,
              code: `${module.code}::${action.code}`,
              description: `Quyền ${action.name} trên module ${module.name}`,
              action,
              module,
              roles: [role],
            }),
          );
        }
      }
    }

    await permissionRepo.save(permissions);
  }
}
