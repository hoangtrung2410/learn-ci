import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DiscoveryModule, DiscoveryService } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthenticationService } from './authentication.service';
import { AuthorizationService } from './authorization.service';
import { STRATEGY_JWT_AUTH } from './constants/auth.constant';
import { AuthFactoryHelper } from './helpers/auth-factory.helper';
import {
  JwtAuthStrategy,
  JwtRefreshStrategy,
  LocalStrategy,
} from './strategies';
import { FactoryHelper } from '../../common/helpers/factory.helper';
import { UserModule } from '../user/user.module';
// import { UserService } from '../user/user.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RoleEntity } from './entities/role.entity';
import { PermissionEntity } from './entities/permission.entity';
import { ModuleEntity } from './entities/module.entity';
import { ActionEntity } from './entities/action.entity';
import {
  ActionRepository,
  ModuleRepository,
  PermissionRepository,
  RoleRepository,
} from './repositories';

@Module({
  imports: [
    forwardRef(() => UserModule),
    PassportModule.register({
      defaultStrategy: STRATEGY_JWT_AUTH,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('jwt'),
    }),
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('microservice'),
    }),
    TypeOrmModule.forFeature([
      RoleEntity,
      PermissionEntity,
      ModuleEntity,
      ActionEntity,
    ]),
    DiscoveryModule,
  ],
  controllers: [AuthController],
  providers: [
    RoleRepository,
    PermissionRepository,
    ModuleRepository,
    ActionRepository,
    DiscoveryService,
    AuthFactoryHelper,
    FactoryHelper,
    AuthenticationService,
    AuthorizationService,
    ConfigService,
    LocalStrategy,
    JwtAuthStrategy,
    JwtRefreshStrategy,
  ],
  exports: [AuthenticationService, AuthorizationService],
})
export class AuthModule {}
