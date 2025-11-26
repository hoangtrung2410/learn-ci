import { DataSource } from 'typeorm';
import { runSeeders } from 'typeorm-extension';
import connectionOptions from '../ormconfig'
import AuthSeeder from './auth.seeder';

async function bootstrap() {
  const dataSource = new DataSource(connectionOptions);

  try {
    await dataSource.initialize();
    await runSeeders(dataSource, {
      seeds: [AuthSeeder],
    });
    console.log('✅ Seeding completed');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await dataSource.destroy();
  }
}

bootstrap();
