import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { TokenEntity } from '../../modules/token/entities/token.entity';

const TOKEN_SEEDS = [
  { name: 'Token của dự án A', token: 'abc-123-xyz' },
  { name: 'Token của dự án B', token: 'def-456-uvw' },
  { name: 'Token của dự án C', token: 'ghi-789-rst' },
];

export default class TokenSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const tokenRepo = dataSource.getRepository(TokenEntity);

    for (const seed of TOKEN_SEEDS) {
      const existingToken = await tokenRepo.findOneBy({ token: seed.token });
      if (!existingToken) {
        const token = tokenRepo.create(seed);
        await tokenRepo.save(token);
      }
    }
  }
}
