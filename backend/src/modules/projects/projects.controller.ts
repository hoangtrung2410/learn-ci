import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationDto } from '../../database/dto/pagination.dto';

@Controller('projects')
@ApiTags('Projects')
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all projects',
    description: 'Retrieve a paginated list of all projects',
  })
  @ApiResponse({
    status: 200,
    description: 'List of projects retrieved successfully',
  })
  getAll(@Query() data: PaginationDto) {
    return this.projectsService.getAll(data);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get project details',
    description: 'Retrieve detailed information about a specific project',
  })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiResponse({ status: 200, description: 'Project details retrieved' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  getDetail(@Param('id') id: string) {
    return this.projectsService.getDetail(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create new project',
    description: 'Create a new project linked to a Git repository',
  })
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid project data' })
  create(@Body() data: CreateProjectDto) {
    return this.projectsService.create(data);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update project',
    description: 'Update an existing project',
  })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiBody({ type: UpdateProjectDto })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  update(@Param('id') id: string, @Body() data: UpdateProjectDto) {
    return this.projectsService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete project',
    description: 'Delete a project and all associated data',
  })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  delete(@Param('id') id: string) {
    return this.projectsService.delete(id);
  }

  @Get(':id/webhook/github')
  @ApiOperation({
    summary: 'Get GitHub webhooks',
    description: 'Get list of webhooks configured on GitHub repository',
  })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiResponse({
    status: 200,
    description: 'List of webhooks',
    schema: {
      example: {
        success: true,
        webhooks: [
          {
            id: 123456789,
            url: 'https://your-domain.com/api/v1/webhooks/github',
            events: ['workflow_run', 'deployment'],
            active: true,
            created_at: '2025-12-02T00:00:00Z',
            updated_at: '2025-12-02T00:00:00Z',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  getWebhooks(@Param('id') id: string) {
    return this.projectsService.getGitHubWebhooks(id);
  }

  @Delete(':id/webhook/github/:webhookId')
  @ApiOperation({
    summary: 'Delete GitHub webhook',
    description: 'Delete a webhook from GitHub repository',
  })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiParam({ name: 'webhookId', description: 'GitHub webhook ID' })
  @ApiResponse({
    status: 200,
    description: 'Webhook deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Webhook deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Project or webhook not found' })
  deleteWebhook(
    @Param('id') id: string,
    @Param('webhookId') webhookId: string,
  ) {
    return this.projectsService.deleteGitHubWebhook(id, parseInt(webhookId));
  }
}
