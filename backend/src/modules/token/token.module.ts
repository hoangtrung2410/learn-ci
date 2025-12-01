import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenEntity } from './entities/token.entity';
import { TokenFactoryHelper } from './helpers/token-factory.helper';
import { TokenRepository } from './repositories/token.repository';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';

@Module({
  imports: [TypeOrmModule.forFeature([TokenEntity])],
  controllers: [TokenController],
  providers: [TokenRepository, TokenFactoryHelper, TokenService],
  exports: [TokenService, TokenFactoryHelper, TokenRepository],
})
export class TokenModule {}
