import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const configService = app.get(ConfigService);
  console.log(`${configService.get('APP_SERVER_HOST')}`);
  const configSwagger = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('CI/CD Performance Analyzer API')
    .setDescription(
      `
# CI/CD Performance Analyzer - API Documentation

## 📊 Overview
Comprehensive API for analyzing CI/CD pipeline performance across different deployment architectures.

## 🎯 Key Features
- **Pipeline Management**: Track and manage CI/CD pipeline executions
- **DORA Metrics**: Calculate DevOps Research and Assessment metrics
- **Performance Analysis**: Detailed performance metrics and trends
- **Architecture Comparison**: Compare Monolithic vs Microservices vs Serverless
- **Automated Recommendations**: AI-driven optimization suggestions
- **Webhook Integration**: GitHub and GitLab webhook support

## 🏗️ Architecture Types
- **Monolithic**: Traditional single-tier architecture
- **Microservices**: Distributed service-oriented architecture
- **Serverless**: Function-as-a-Service architecture
- **Hybrid**: Mixed architecture approach

## 📈 Metrics Provided
### DORA Metrics
- Lead Time for Changes
- Deployment Frequency
- Change Failure Rate
- Mean Time to Recovery (MTTR)

### CI/CD Metrics
- Success Rate
- Average Pipeline Duration
- Build/Test/Deploy Time Breakdown
- Cost Analysis

## 🔐 Authentication
All endpoints (except webhooks) require Bearer token authentication.

## 📚 Documentation
For detailed documentation, see:
- PIPELINE_ANALYSIS_API.md
- DATABASE_RELATIONSHIPS.md
- ARCHITECTURE.md
      `,
    )
    .setVersion('1.0.0')
    .setContact(
      'Development Team',
      'https://github.com/hoangtrung2410/learn-ci',
      'contact@example.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .setExternalDoc('swagger.json', '/swagger.json')
    .addServer(
      `http://localhost:${process.env['PORT']}`,
      'Local Development Server',
    )
    .addServer(
      `${configService.get('APP_SERVER_HOST')}`,
      'Production API Server',
    )
    .addTag('Pipelines', 'CI/CD Pipeline management and operations')
    .addTag('Metrics', 'DORA and CI/CD performance metrics')
    .addTag('Analysis', 'Automated analysis and recommendations')
    .addTag('Architectures', 'Deployment architecture management')
    .addTag('Components', 'Architecture component management')
    .addTag('Templates', 'Pipeline template management')
    .addTag('Webhooks', 'GitHub and GitLab webhook receivers')
    .addTag('Projects', 'Project management')
    .addTag('Tokens', 'GitHub/GitLab token management')
    .addTag('Health', 'API health check endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, configSwagger, {
    deepScanRoutes: true,
  });

  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai',
      },
      tryItOutEnabled: true,
    },
    customSiteTitle: 'CI/CD Performance Analyzer API',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 50px 0 }
      .swagger-ui .scheme-container { background: #fafafa; padding: 20px; margin-bottom: 20px }
    `,
    jsonDocumentUrl: 'swagger.json',
  });
}
