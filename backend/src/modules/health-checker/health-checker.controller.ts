import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { HealthCheckResult } from '@nestjs/terminus';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
  MicroserviceHealthIndicator,
} from '@nestjs/terminus';
import { Transport } from '@nestjs/microservices';

@Controller('health')
@ApiTags('Health Check')
export class HealthCheckerController {
  constructor(
    private healthCheckService: HealthCheckService,
    private ormIndicator: TypeOrmHealthIndicator,
    private microservice: MicroserviceHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Health check',
    description: 'Check the health status of the application and database',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy',
    schema: {
      example: {
        status: 'ok',
        info: {
          database: {
            status: 'up',
          },
        },
        error: {},
        details: {
          database: {
            status: 'up',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Application is unhealthy',
  })
  async check(): Promise<HealthCheckResult> {
    return await this.healthCheckService.check([
      () => this.ormIndicator.pingCheck('database', { timeout: 1500 }),
    ]);
  }
}
