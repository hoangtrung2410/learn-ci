import { DataSource } from 'typeorm';
import { runSeeders } from 'typeorm-extension';
import connectionOptions from '../ormconfig';
import { seedArchitectures } from './architecture.seeder';
import UserSeeder from './user.seeder';
import TokenSeeder from './token.seeder';
import ProjectSeeder from './project.seeder';
import PipelineSeeder from './pipeline.seeder';
import AnalysisSeeder from './analysis.seeder';

async function bootstrap() {
  const dataSource = new DataSource(connectionOptions);

  try {
    await dataSource.initialize();

    console.log('🌱 Starting database seeding...\n');

    // Seed in order of dependencies:
    // 1. Architecture (no dependencies)
    console.log('📐 Seeding architectures...');
    await seedArchitectures(dataSource);

    // 2. Users (needs roles from auth seeder)
    console.log('👤 Seeding users...');
    await runSeeders(dataSource, {
      seeds: [UserSeeder],
    });

    // 3. Tokens (no dependencies on other data)
    console.log('🔑 Seeding tokens...');
    await runSeeders(dataSource, {
      seeds: [TokenSeeder],
    });

    // 4. Projects (needs tokens and architectures)
    console.log('📁 Seeding projects...');
    await runSeeders(dataSource, {
      seeds: [ProjectSeeder],
    });

    // 5. Pipelines (needs projects and architectures)
    console.log('🔄 Seeding pipelines...');
    await runSeeders(dataSource, {
      seeds: [PipelineSeeder],
    });

    // 6. Analyses (needs projects and pipelines)
    console.log('📊 Seeding analyses...');
    await runSeeders(dataSource, {
      seeds: [AnalysisSeeder],
    });

    console.log('\n✅ All seeding completed successfully!');
    console.log('\n📝 Default credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Password: password123\n');
  } catch (err) {
    console.error('\n❌ Seeding failed:', err);
    throw err;
  } finally {
    await dataSource.destroy();
  }
}

bootstrap();
