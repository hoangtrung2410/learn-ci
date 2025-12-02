import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiBody,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { PipelineService } from './pipeline.service';
import { PipelineFactoryHelper } from './helpers/pipeline-factory.helper';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly pipelineService: PipelineService,
    private readonly pipelineFactory: PipelineFactoryHelper,
  ) {}

  @Post('github')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'GitHub webhook endpoint',
    description:
      'Receive and process GitHub workflow_run events to automatically create pipeline records',
  })
  @ApiHeader({
    name: 'x-github-event',
    description: 'GitHub event type',
    required: true,
  })
  @ApiHeader({
    name: 'x-hub-signature-256',
    description: 'GitHub webhook signature',
    required: false,
  })
  @ApiBody({
    description: 'GitHub webhook payload',
    schema: {
      type: 'object',
      properties: {
        action: { type: 'string', example: 'completed' },
        workflow_run: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            status: { type: 'string' },
            conclusion: { type: 'string' },
          },
        },
        repository: {
          type: 'object',
          properties: {
            html_url: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
    schema: {
      example: {
        message: 'Webhook processed successfully',
        pipeline_id: '123e4567-e89b-12d3-a456-426614174000',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Could not identify project' })
  async handleGitHubWebhook(
    @Body() payload: any,
    @Headers('x-github-event') event: string,
    @Headers('x-hub-signature-256') signature: string,
  ) {
    this.logger.log(`Received GitHub webhook event: ${event}`);

    try {
      // Only process workflow_run events for now
      if (event !== 'workflow_run') {
        return { message: 'Event ignored' };
      }

      // Extract project_id from repository or use a mapping
      // For now, you'll need to implement project identification logic
      const projectId = await this.identifyProject(
        payload.repository?.html_url,
      );

      if (!projectId) {
        throw new BadRequestException('Could not identify project');
      }

      const pipelineData = this.pipelineFactory.createPipelineFromGitHub(
        payload,
        projectId,
      );

      const pipeline = await this.pipelineService.create(pipelineData as any);

      return {
        message: 'Webhook processed successfully',
        pipeline_id: pipeline.id,
      };
    } catch (error) {
      this.logger.error(`Error processing GitHub webhook: ${error.message}`);
      throw error;
    }
  }

  @Post('gitlab')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'GitLab webhook endpoint',
    description:
      'Receive and process GitLab Pipeline Hook events to automatically create pipeline records',
  })
  @ApiHeader({
    name: 'x-gitlab-event',
    description: 'GitLab event type',
    required: true,
  })
  @ApiHeader({
    name: 'x-gitlab-token',
    description: 'GitLab webhook token',
    required: false,
  })
  @ApiBody({
    description: 'GitLab webhook payload',
    schema: {
      type: 'object',
      properties: {
        object_kind: { type: 'string', example: 'pipeline' },
        object_attributes: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            status: { type: 'string' },
            duration: { type: 'number' },
          },
        },
        project: {
          type: 'object',
          properties: {
            web_url: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
    schema: {
      example: {
        message: 'Webhook processed successfully',
        pipeline_id: '123e4567-e89b-12d3-a456-426614174000',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Could not identify project' })
  async handleGitLabWebhook(
    @Body() payload: any,
    @Headers('x-gitlab-event') event: string,
    @Headers('x-gitlab-token') token: string,
  ) {
    this.logger.log(`Received GitLab webhook event: ${event}`);

    try {
      // Only process Pipeline Hook events
      if (event !== 'Pipeline Hook') {
        return { message: 'Event ignored' };
      }

      const projectId = await this.identifyProject(payload.project?.web_url);

      if (!projectId) {
        throw new BadRequestException('Could not identify project');
      }

      const pipelineData = this.pipelineFactory.createPipelineFromGitLab(
        payload,
        projectId,
      );

      const pipeline = await this.pipelineService.create(pipelineData as any);

      return {
        message: 'Webhook processed successfully',
        pipeline_id: pipeline.id,
      };
    } catch (error) {
      this.logger.error(`Error processing GitLab webhook: ${error.message}`);
      throw error;
    }
  }

  @Post('generic')
  @HttpCode(HttpStatus.OK)
  async handleGenericWebhook(
    @Body() payload: any,
    @Headers('x-project-id') projectId: string,
  ) {
    this.logger.log('Received generic webhook');

    try {
      if (!projectId) {
        throw new BadRequestException('x-project-id header is required');
      }

      const pipelineData = this.pipelineFactory.createPipelineFromWebhook(
        payload,
        projectId,
      );

      const pipeline = await this.pipelineService.create(pipelineData as any);

      return {
        message: 'Webhook processed successfully',
        pipeline_id: pipeline.id,
      };
    } catch (error) {
      this.logger.error(`Error processing generic webhook: ${error.message}`);
      throw error;
    }
  }

  private async identifyProject(repositoryUrl: string): Promise<string | null> {
    // TODO: Implement project identification logic
    // This could query the projects table by repository URL
    // For now, return null and require manual project_id in headers
    this.logger.warn('Project identification not implemented');
    return null;
  }
}
