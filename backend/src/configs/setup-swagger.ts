import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const configService = app.get(ConfigService);
  console.log(`${configService.get('APP_SERVER_HOST')}`);
  const configSwagger = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('SMART_IAM')
    .setDescription('SMART_IAM Swagger API Documentation')
    .setVersion('1.0')
    .setExternalDoc('swagger.json', 'swagger.json')
    .addServer(`http://localhost:${process.env['PORT']}`, 'Local Server')
    .addServer(`${configService.get('APP_SERVER_HOST')}`, 'API TYK')
    .build();
  const document = SwaggerModule.createDocument(app, configSwagger, {
    deepScanRoutes: true,
  });
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: { persistAuthorization: true },
    jsonDocumentUrl: 'swagger.json',
  });
}
