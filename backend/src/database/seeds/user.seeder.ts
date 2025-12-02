import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { UserEntity } from '../../modules/user/entities/user.entity';
import { RoleEntity } from '../../modules/auth/entities';
import * as bcrypt from 'bcrypt';

export default class UserSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(UserEntity);
    const roleRepository = dataSource.getRepository(RoleEntity);

    // Find or create roles
    let adminRole = await roleRepository.findOne({ where: { name: 'Admin' } });
    let developerRole = await roleRepository.findOne({
      where: { name: 'Developer' },
    });
    let viewerRole = await roleRepository.findOne({
      where: { name: 'Viewer' },
    });

    if (!adminRole) {
      adminRole = roleRepository.create({
        name: 'Admin',
        description: 'Administrator with full access',
      });
      await roleRepository.save(adminRole);
    }

    if (!developerRole) {
      developerRole = roleRepository.create({
        name: 'Developer',
        description: 'Developer with project access',
      });
      await roleRepository.save(developerRole);
    }

    if (!viewerRole) {
      viewerRole = roleRepository.create({
        name: 'Viewer',
        description: 'Read-only access',
      });
      await roleRepository.save(viewerRole);
    }

    // Check if users already exist
    const existingUsers = await userRepository.count();
    if (existingUsers > 0) {
      console.log('👤 Users already seeded, skipping...');
      return;
    }

    const saltRounds = 10;
    const defaultPassword = await bcrypt.hash('password123', saltRounds);

    const users = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: defaultPassword,
        role: adminRole,
        isActive: true,
      },
      {
        name: 'John Developer',
        email: 'john.dev@example.com',
        password: defaultPassword,
        role: developerRole,
        isActive: true,
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: defaultPassword,
        role: developerRole,
        isActive: true,
      },
      {
        name: 'Bob Viewer',
        email: 'bob.viewer@example.com',
        password: defaultPassword,
        role: viewerRole,
        isActive: true,
      },
      {
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
        password: defaultPassword,
        role: developerRole,
        isActive: true,
      },
    ];

    for (const userData of users) {
      const user = userRepository.create(userData);
      await userRepository.save(user);
    }

    console.log('✅ Users seeded successfully');
  }
}
