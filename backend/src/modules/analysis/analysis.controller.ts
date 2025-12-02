import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AnalysisService } from './analysis.service';
import { AnalysisType } from './entities/analysis.entity';

@ApiTags('Analysis')
@ApiBearerAuth()
@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('projects/:projectId/analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Analyze project performance',
    description:
      'Generate comprehensive performance analysis for a project including DORA metrics, CI/CD metrics, and recommendations',
  })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiQuery({
    name: 'start_date',
    required: false,
    description: 'Analysis start date (ISO format)',
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    description: 'Analysis end date (ISO format)',
  })
  @ApiResponse({
    status: 200,
    description: 'Analysis completed successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        type: 'PROJECT_PERFORMANCE',
        metrics: {
          dora: { lead_time: 24.5, deployment_frequency: 3.2 },
          cicd: { success_rate: 87.5, total_pipelines: 150 },
        },
        recommendations: [
          { priority: 'HIGH', title: 'Reduce build time', description: '...' },
        ],
      },
    },
  })
  async analyzeProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : this.getDefaultStartDate();
    const end = endDate ? new Date(endDate) : new Date();

    return this.analysisService.analyzeProject(projectId, start, end);
  }

  @Post('compare-architectures')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Compare architectures',
    description:
      'Compare performance metrics across different deployment architectures (Monolithic vs Microservices vs Serverless)',
  })
  @ApiQuery({
    name: 'start_date',
    required: false,
    description: 'Comparison start date (ISO format)',
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    description: 'Comparison end date (ISO format)',
  })
  @ApiResponse({
    status: 200,
    description: 'Architecture comparison completed',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        type: 'ARCHITECTURE_COMPARISON',
        metrics: {
          monolithic: { lead_time: 48, deployment_frequency: 0.5 },
          microservices: { lead_time: 12, deployment_frequency: 5.2 },
          serverless: { lead_time: 6, deployment_frequency: 10.5 },
        },
        recommended_architecture: 'microservices',
        recommendations: [],
      },
    },
  })
  async compareArchitectures(
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : this.getDefaultStartDate();
    const end = endDate ? new Date(endDate) : new Date();

    return this.analysisService.compareArchitectures(start, end);
  }

  @Get('projects/:projectId')
  @ApiOperation({
    summary: 'Get project analyses',
    description: 'Get all analysis reports for a specific project',
  })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiResponse({
    status: 200,
    description: 'List of analyses retrieved successfully',
  })
  async getProjectAnalyses(
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ) {
    return this.analysisService.getProjectAnalyses(projectId);
  }

  @Get('latest')
  @ApiOperation({
    summary: 'Get latest analysis',
    description:
      'Get the most recent analysis report, optionally filtered by project and type',
  })
  @ApiQuery({
    name: 'project_id',
    required: false,
    description: 'Filter by project UUID',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: [
      'PROJECT_PERFORMANCE',
      'ARCHITECTURE_COMPARISON',
      'COST_ANALYSIS',
      'SECURITY_ANALYSIS',
    ],
    description: 'Filter by analysis type',
  })
  @ApiResponse({
    status: 200,
    description: 'Latest analysis retrieved successfully',
  })
  async getLatestAnalysis(
    @Query('project_id') projectId?: string,
    @Query('type') type?: AnalysisType,
  ) {
    return this.analysisService.getLatestAnalysis(projectId, type);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get analysis by ID',
    description: 'Get detailed information about a specific analysis report',
  })
  @ApiParam({ name: 'id', description: 'Analysis UUID' })
  @ApiResponse({
    status: 200,
    description: 'Analysis details retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Analysis not found' })
  async getAnalysisById(@Param('id', ParseUUIDPipe) id: string) {
    return this.analysisService.getAnalysisById(id);
  }

  private getDefaultStartDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Last 30 days
    return date;
  }
}
