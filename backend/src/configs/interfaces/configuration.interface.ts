import {
  CorsOptions,
  CorsOptionsDelegate,
} from '@nestjs/common/interfaces/external/cors-options.interface';
import { JwtModuleOptions } from '@nestjs/jwt/dist/interfaces/jwt-module-options.interface';
import { RabbitMQConfig } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AxiosRequestConfig } from 'axios';
import { DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';

export interface IConfiguration {
  database: TypeOrmModuleOptions & SeederOptions & DataSourceOptions;
  environment: string;
  redis: {
    isGlobal: boolean;
    url: string;
  };
  app: {
    appName: string;
    port: number;
    cors: CorsOptions | CorsOptionsDelegate<any>;
  };
  frontend: {
    baseUrl: string;
    assignedTopicUrl: string;
  };
  jwt: JwtModuleOptions;
  authentication: {
    accessTokenExpiresInSec: number;
    refreshTokenExpiresInSec: number;
    resetPasswordUrl: string;
    resetPasswordExpire: number;
    registerUrl: string;
    loginUrl: string;
    communicationPublic: string;
    communicationPrivate: string;
  };
  microservice: RabbitMQConfig;
  hubspotAxios: AxiosRequestConfig<any>;
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  s3: {
    region: string;
    publicFolder: string;
    publicBucketName: string;
  };
}
