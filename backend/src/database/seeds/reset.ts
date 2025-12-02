import { DataSource } from 'typeorm';
import connectionOptions from '../ormconfig';

async function resetDatabase() {
  const dataSource = new DataSource(connectionOptions);

  try {
    await dataSource.initialize();

    console.log('🗑️  Clearing existing data...\n');

    // Delete in reverse order of dependencies
    console.log('Deleting analyses...');
    await dataSource.query('DELETE FROM analyses');

    console.log('Deleting pipelines...');
    await dataSource.query('DELETE FROM pipelines');

    console.log('Deleting projects...');
    await dataSource.query('DELETE FROM projects');

    console.log('Deleting tokens...');
    await dataSource.query('DELETE FROM tokens');

    console.log('Deleting users...');
    await dataSource.query('DELETE FROM users');

    console.log('Deleting roles...');
    await dataSource.query('DELETE FROM roles');

    console.log('Deleting deployment_architectures...');
    await dataSource.query('DELETE FROM deployment_architectures');

    console.log('\n✅ All data cleared successfully!\n');
  } catch (err) {
    console.error('❌ Failed to clear data:', err);
    throw err;
  } finally {
    await dataSource.destroy();
  }
}

resetDatabase();
