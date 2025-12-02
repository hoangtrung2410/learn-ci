import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { ProjectEntity } from '../../modules/projects/entities/project.entity';
import { TokenEntity } from '../../modules/token/entities/token.entity';
import { DeploymentArchitectureEntity } from '../../modules/architecture/entities/deployment-architecture.entity';

export default class ProjectSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const projectRepository = dataSource.getRepository(ProjectEntity);
    const tokenRepository = dataSource.getRepository(TokenEntity);
    const architectureRepository = dataSource.getRepository(
      DeploymentArchitectureEntity,
    );

    // Check if projects already exist
    const existingProjects = await projectRepository.count();
    if (existingProjects > 0) {
      console.log('📁 Projects already seeded, skipping...');
      return;
    }

    // Get existing tokens and architectures
    const tokens = await tokenRepository.find({ take: 3 });
    const architectures = await architectureRepository.find();

    const monolithicArch = architectures.find((a) => a.key === 'MONOLITHIC');
    const microservicesArch = architectures.find(
      (a) => a.key === 'MICROSERVICES',
    );
    const serverlessArch = architectures.find((a) => a.key === 'SERVERLESS');

    const projects = [
      {
        name: 'E-Commerce Platform',
        description:
          'Main e-commerce application with product catalog, shopping cart, and checkout',
        url_organization: 'https://github.com/acme-corp/ecommerce-platform',
        token_id: tokens[0]?.id,
        architecture_id: monolithicArch?.id,
      },
      {
        name: 'Microservices Backend',
        description:
          'Microservices-based backend with separate services for users, orders, inventory, and payments',
        url_organization: 'https://github.com/acme-corp/microservices-backend',
        token_id: tokens[1]?.id,
        architecture_id: microservicesArch?.id,
      },
      {
        name: 'Mobile App API',
        description:
          'REST API for mobile applications with authentication and data sync',
        url_organization: 'https://github.com/acme-corp/mobile-api',
        token_id: tokens[0]?.id,
        architecture_id: microservicesArch?.id,
      },
      {
        name: 'Serverless Analytics',
        description:
          'Serverless data processing and analytics pipeline using AWS Lambda',
        url_organization: 'https://github.com/acme-corp/serverless-analytics',
        token_id: tokens[2]?.id,
        architecture_id: serverlessArch?.id,
      },
      {
        name: 'Admin Dashboard',
        description:
          'Administrative dashboard for managing users, orders, and system configuration',
        url_organization: 'https://github.com/acme-corp/admin-dashboard',
        token_id: tokens[1]?.id,
        architecture_id: monolithicArch?.id,
      },
      {
        name: 'Payment Gateway',
        description:
          'Payment processing service with support for multiple payment providers',
        url_organization: 'https://github.com/acme-corp/payment-gateway',
        token_id: tokens[0]?.id,
        architecture_id: microservicesArch?.id,
      },
      {
        name: 'Notification Service',
        description:
          'Microservice for sending emails, SMS, and push notifications',
        url_organization: 'https://github.com/acme-corp/notification-service',
        token_id: tokens[2]?.id,
        architecture_id: serverlessArch?.id,
      },
      {
        name: 'Legacy Monolith',
        description:
          'Legacy monolithic application being gradually migrated to microservices',
        url_organization: 'https://github.com/acme-corp/legacy-app',
        token_id: tokens[1]?.id,
        architecture_id: monolithicArch?.id,
      },
    ];

    for (const projectData of projects) {
      const project = projectRepository.create(projectData);
      await projectRepository.save(project);
    }

    console.log('✅ Projects seeded successfully');
  }
}
