/*
                       _oo0oo_
                      o8888888o
                      88" . "88
                      (| -_- |)
                      0\  =  /0
                    ___/`---'\___
                  .' \\|     |// '.
                 / \\|||  :  |||// \
                / _||||| -:- |||||- \
               |   | \\\  -  /// |   |
               | \_|  ''\---/''  |_/ |
               \  .-\__  '-'  ___/-. /
             ___'. .'  /--.--\  `. .'___
          ."" '<  `.___\_<|>_/___.' >' "".
         | | :  `- \`.;`\ _ /`;.`/ - ` : | |
         \  \ `_.   \_ __\ /__ _/   .-` /  /
     =====`-.____`.___ \_____/___.-`___.-'=====
                       `=---='

             KEEP EVERYTHING IS SIMPLE!
     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
       Buddha blesses you with no bugs forever
 */

import {
  BadRequestException,
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { useContainer, ValidationError } from 'class-validator';
import * as compression from 'compression';
import * as morgan from 'morgan';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config();

import { AppModule } from './app.module';
import { API_PREFIX, API_VERSION } from './constants';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { setupSwagger } from './configs/setup-swagger';
import connectionOptions from './database/ormconfig';

const logger = new Logger('Bootstrap');

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error.stack || error);
});

async function bootstrap() {
  try {
    // Test kết nối database trước khi tạo Nest app
    console.log('🔹 Database config:', connectionOptions);
    const testDataSource = new DataSource(connectionOptions);
    await testDataSource.initialize();
    logger.log('✅ Database connected successfully!');
  } catch (error) {
    console.error('❌ Database connection failed!', error.stack || error);
    process.exit(1);
  }

  // Tạo Nest app
  const app = await NestFactory.create(AppModule);

  // Global Prefix
  app.setGlobalPrefix(`${API_PREFIX}/${API_VERSION}`);

  const allowedOrigins = 'http://localhost:5173';
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin like curl/postman or same-origin server-to-server
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new BadRequestException(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  });
  // Middleware
  app.use(compression());
  app.use(morgan('dev'));

  // Validation
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      exceptionFactory: (errors: ValidationError[]) =>
        new BadRequestException(errors),
    }),
  );

  // Interceptors
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  // Swagger
  setupSwagger(app);
  const port = process.env['PORT'] || 3000;
  await app.startAllMicroservices();
  await app.listen(port);
  logger.log(`🚀 Server listening on port ${port}`);
}

bootstrap();
