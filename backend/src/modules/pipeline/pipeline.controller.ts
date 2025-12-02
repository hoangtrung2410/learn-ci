import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { PipelineService } from './pipeline.service';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { UpdatePipelineDto } from './dto/update-pipeline.dto';
import { QueryPipelineDto } from './dto/query-pipeline.dto';
import { PipelineStatus } from './entities/pipeline.entity';

@ApiTags('Pipelines')
@ApiBearerAuth()
@Controller('pipelines')
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new pipeline',
    description: 'Create a new CI/CD pipeline record with performance metrics',
  })
  @ApiResponse({
    status: 201,
    description: 'Pipeline created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async create(@Body() createDto: CreatePipelineDto) {
    return this.pipelineService.create(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get list of pipelines',
    description: 'Get paginated list of pipelines with filtering options',
  })
  @ApiResponse({
    status: 200,
    description: 'List of pipelines retrieved successfully',
  })
  async getList(@Query() query: QueryPipelineDto) {
    return this.pipelineService.getList(query);
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Get pipeline statistics',
    description:
      'Get aggregated statistics for pipelines (total, success rate, etc.)',
  })
  @ApiQuery({
    name: 'project_id',
    required: false,
    description: 'Filter by project ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStatistics(@Query('project_id') projectId?: string) {
    return this.pipelineService.getStatistics(projectId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get pipeline by ID',
    description: 'Get detailed information about a specific pipeline',
  })
  @ApiParam({ name: 'id', description: 'Pipeline UUID' })
  @ApiResponse({
    status: 200,
    description: 'Pipeline details retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Pipeline not found' })
  async getDetail(@Param('id', ParseUUIDPipe) id: string) {
    return this.pipelineService.getDetail(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update pipeline',
    description: 'Update pipeline information and metrics',
  })
  @ApiParam({ name: 'id', description: 'Pipeline UUID' })
  @ApiResponse({ status: 200, description: 'Pipeline updated successfully' })
  @ApiResponse({ status: 404, description: 'Pipeline not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePipelineDto,
  ) {
    return this.pipelineService.update(id, updateDto);
  }

  @Put(':id/status')
  @ApiOperation({
    summary: 'Update pipeline status',
    description: 'Update the status of a running pipeline',
  })
  @ApiParam({ name: 'id', description: 'Pipeline UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELED'],
          description: 'New pipeline status',
        },
        error_message: {
          type: 'string',
          description: 'Error message if failed',
        },
      },
      required: ['status'],
    },
  })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Pipeline not found' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: PipelineStatus,
    @Body('error_message') errorMessage?: string,
  ) {
    return this.pipelineService.updateStatus(id, status, errorMessage);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete pipeline',
    description: 'Permanently delete a pipeline record',
  })
  @ApiParam({ name: 'id', description: 'Pipeline UUID' })
  @ApiResponse({ status: 204, description: 'Pipeline deleted successfully' })
  @ApiResponse({ status: 404, description: 'Pipeline not found' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.pipelineService.delete(id);
  }
}
