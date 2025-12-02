import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './configs/configurations';
import { ExceptionFilter } from './filters/exception.filter';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { TokenModule } from './modules/token/token.module';
import { HealthCheckerModule } from './modules/health-checker/health-checker.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { PipelineModule } from './modules/pipeline/pipeline.module';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { ArchitectureModule } from './modules/architecture/architecture.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('database'),
    }),
    UserModule,
    AuthModule,
    TokenModule,
    ProjectsModule,
    PipelineModule,
    AnalysisModule,
    ArchitectureModule,
    HealthCheckerModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useFactory: () => {
        return new ExceptionFilter();
      },
      inject: [],
    },
  ],
})
export class AppModule {}
