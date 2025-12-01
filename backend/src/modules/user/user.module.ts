import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserFactoryHelper } from './helpers/user-factory.helper';
import { UserRepository } from './repositories/user.repository';
import { AdminUsersController } from './user-admin.controller';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { RoleEntity } from '../auth/entities';
import { AuthFactoryHelper } from '../auth/helpers/auth-factory.helper';
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RoleEntity]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController, AdminUsersController],
  providers: [
    UserRepository,
    UserService,
    ConfigService,
    AuthFactoryHelper,
    UserFactoryHelper,
  ],
  exports: [UserService, UserFactoryHelper],
})
export class UserModule {}
