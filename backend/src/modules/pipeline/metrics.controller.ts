import { Controller, Get, Query, Param, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { MetricsService } from './services/metrics.service';
import { ServiceType } from './entities/pipeline.entity';

@ApiTags('Metrics')
@ApiBearerAuth()
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('dora/:projectId')
  @ApiOperation({
    summary: 'Get DORA metrics',
    description:
      'Calculate DORA (DevOps Research and Assessment) metrics: Lead Time, Deployment Frequency, Change Failure Rate, MTTR',
  })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiQuery({
    name: 'start_date',
    required: false,
    description: 'Start date (ISO format)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    description: 'End date (ISO format)',
    example: '2024-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'DORA metrics calculated successfully',
    schema: {
      example: {
        lead_time_hours: 24.5,
        deployment_frequency: 3.2,
        change_failure_rate: 12.5,
        mean_time_to_recovery_hours: 2.3,
      },
    },
  })
  async getDORAMetrics(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : this.getDefaultStartDate();
    const end = endDate ? new Date(endDate) : new Date();

    return this.metricsService.calculateDORAMetrics(projectId, start, end);
  }

  @Get('cicd/:projectId')
  @ApiOperation({
    summary: 'Get CI/CD metrics',
    description:
      'Calculate CI/CD pipeline metrics: success rate, average duration, failure analysis',
  })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiQuery({
    name: 'start_date',
    required: false,
    description: 'Start date (ISO format)',
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    description: 'End date (ISO format)',
  })
  @ApiResponse({
    status: 200,
    description: 'CI/CD metrics calculated successfully',
    schema: {
      example: {
        total_pipelines: 150,
        success_rate: 87.5,
        average_duration_minutes: 15.2,
        total_failures: 19,
      },
    },
  })
  async getCICDMetrics(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : this.getDefaultStartDate();
    const end = endDate ? new Date(endDate) : new Date();

    return this.metricsService.calculateCICDMetrics(projectId, start, end);
  }

  @Get('performance/:projectId')
  @ApiOperation({
    summary: 'Get performance metrics',
    description:
      'Calculate detailed performance metrics: build time, test time, deploy time by service type',
  })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiQuery({
    name: 'start_date',
    required: false,
    description: 'Start date (ISO format)',
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    description: 'End date (ISO format)',
  })
  @ApiQuery({
    name: 'service_type',
    required: false,
    enum: [
      'FRONTEND',
      'BACKEND',
      'DATABASE',
      'CACHE',
      'MESSAGE_QUEUE',
      'API_GATEWAY',
      'MONITORING',
    ],
    description: 'Filter by service type',
  })
  @ApiResponse({
    status: 200,
    description: 'Performance metrics calculated successfully',
    schema: {
      example: {
        average_build_time: 180,
        average_test_time: 120,
        average_deploy_time: 90,
        p95_build_time: 240,
        total_cost: 45.5,
      },
    },
  })
  async getPerformanceMetrics(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('service_type') serviceType?: ServiceType,
  ) {
    const start = startDate ? new Date(startDate) : this.getDefaultStartDate();
    const end = endDate ? new Date(endDate) : new Date();

    return this.metricsService.calculatePerformanceMetrics(
      projectId,
      start,
      end,
      serviceType,
    );
  }

  @Get('compare')
  @ApiOperation({
    summary: 'Compare service types',
    description:
      'Compare performance metrics across different service types (Frontend vs Backend vs Database, etc.)',
  })
  @ApiQuery({
    name: 'start_date',
    required: false,
    description: 'Start date (ISO format)',
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    description: 'End date (ISO format)',
  })
  @ApiResponse({
    status: 200,
    description: 'Service type comparison completed',
    schema: {
      example: {
        FRONTEND: { avg_build_time: 120, success_rate: 90 },
        BACKEND: { avg_build_time: 200, success_rate: 85 },
        DATABASE: { avg_build_time: 60, success_rate: 95 },
      },
    },
  })
  async compareServiceTypes(
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : this.getDefaultStartDate();
    const end = endDate ? new Date(endDate) : new Date();

    return this.metricsService.compareServiceTypes(start, end);
  }

  @Get('trends/:projectId')
  @ApiOperation({
    summary: 'Get performance trends',
    description:
      'Get time-series performance trends with configurable intervals (daily, weekly, monthly)',
  })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiQuery({
    name: 'start_date',
    required: false,
    description: 'Start date (ISO format)',
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    description: 'End date (ISO format)',
  })
  @ApiQuery({
    name: 'interval',
    required: false,
    enum: ['day', 'week', 'month'],
    description: 'Aggregation interval',
    example: 'day',
  })
  @ApiResponse({
    status: 200,
    description: 'Performance trends retrieved successfully',
    schema: {
      example: {
        trends: [
          { date: '2024-01-01', avg_duration: 15.2, success_rate: 87 },
          { date: '2024-01-02', avg_duration: 14.8, success_rate: 89 },
        ],
      },
    },
  })
  async getPerformanceTrends(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('interval') interval?: 'day' | 'week' | 'month',
  ) {
    const start = startDate ? new Date(startDate) : this.getDefaultStartDate();
    const end = endDate ? new Date(endDate) : new Date();
    const intervalType = interval || 'day';

    return this.metricsService.getPerformanceTrends(
      projectId,
      start,
      end,
      intervalType,
    );
  }

  private getDefaultStartDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Last 30 days
    return date;
  }
}
