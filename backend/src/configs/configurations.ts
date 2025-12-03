import { IConfiguration } from './interfaces/configuration.interface';
import { EXCHANGES_NAME, EXCHANGES_TYPE } from '../constants';
import connectionOptions from '../database/ormconfig';

export default (): IConfiguration => ({
  environment: process.env.ENV || 'development',
  redis: {
    isGlobal: true,
    url: process.env.REDIS_CONN || 'redis://localhost:6379/0',
  },
  app: {
    appName: process.env.APP_NAME,
    port: parseInt(process.env.APP_PORT) || 3000,
    url: process.env.APP_URL || 'http://localhost:3000',
    cors: {
      origin: process.env.CORS_ORIGIN,
      methods: process.env.CORS_METHODS,
      allowedHeaders: process.env.CORS_ALLOWED_HEADERS,
      exposedHeaders: process.env.CORS_EXPOSED_HEADERS,
      credentials: process.env.CORS_CREDENTIALS === 'true',
      preflightContinue: process.env.CORS_PREFLIGHT_CONTINUE === 'true',
    },
  },
  frontend: {
    baseUrl: process.env.FORTEND_BASE_URL || 'http://localhost:3000',
    assignedTopicUrl:
      process.env.ASSIGNED_TOPIC_DETAIL_PATH ||
      '/content-management/content-details',
  },
  database: connectionOptions,
  jwt: {
    privateKey: process.env.JWT_PRIVATE_KEY_BASE64
      ? Buffer.from(process.env.JWT_PRIVATE_KEY_BASE64, 'base64').toString(
          'utf8',
        )
      : '',
    publicKey: process.env.JWT_PUBLIC_KEY_BASE64
      ? Buffer.from(process.env.JWT_PUBLIC_KEY_BASE64, 'base64').toString(
          'utf8',
        )
      : '',
    signOptions: {
      allowInsecureKeySizes: true,
      algorithm: 'RS256',
    },
  },

  authentication: {
    accessTokenExpiresInSec: parseInt(
      process.env.JWT_ACCESS_TOKEN_EXP_IN_SEC,
      10,
    ),
    refreshTokenExpiresInSec: parseInt(
      process.env.JWT_REFRESH_TOKEN_EXP_IN_SEC,
      10,
    ),
    resetPasswordUrl:
      process.env.AUTHENCATION_RESET_PASSWORD_PATH ||
      '/forget-password/reset-password',
    resetPasswordExpire:
      parseInt(process.env.AUTHENCATION_RESET_PASSWORD_EXPIRE, 10) || 900,
    registerUrl: process.env.AUTHENCATION_REGISTER_PATH || '/register',
    loginUrl: process.env.AUTHENCATION_LOGIN_PATH || '/login',
    communicationPublic:
      process.env.COMMUNICATION_PUBLIC ||
      '/communication-builder-public/message-detail',
    communicationPrivate:
      process.env.COMMUNICATION_PRIVATE ||
      '/communication-builder-private/message-detail',
  },
  microservice: {
    uri: process.env.RABBITMQ_CONN,
    exchanges: [
      {
        name: EXCHANGES_NAME,
        type: EXCHANGES_TYPE,
      },
      {
        name: 'my.exchange',
        type: 'topic',
      },
    ],
    connectionInitOptions: { wait: true },
  },
  hubspotAxios: {
    baseURL: process.env.HUBSPORT_BASE_URL || 'https://api.hubapi.com',
    headers: {
      Authorization: `Bearer ${process.env.HUBSPORT_ACCESS_TOKEN}`,
    },
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  s3: {
    region: process.env.AWS_REGION,
    publicFolder: process.env.AWS_FOLDER_DEFAULT,
    publicBucketName: process.env.AWS_PUBLIC_BUCKET_NAME,
  },
});
