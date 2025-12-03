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
      if (event !== 'workflow_run') {
        return { message: 'Event ignored' };
      }
      // Process only completed workflow runs
      console.log('payload', payload);

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

      // Fetch workflow jobs to populate stages and logs
      this.logger.log(`Fetching workflow jobs for pipeline ${pipeline.id}...`);
      await this.fetchAndSaveWorkflowLogs(payload, pipeline.id, projectId);

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
    if (!repositoryUrl) {
      this.logger.warn('No repository URL provided');
      return null;
    }

    this.logger.log(`🔍 Identifying project from URL: ${repositoryUrl}`);

    try {
      // Extract organization from repository URL
      // Example: https://github.com/Web-do-an/repo-name → Web-do-an
      const orgMatch = repositoryUrl.match(/github\.com\/([^\/]+)/);
      if (!orgMatch) {
        this.logger.warn(
          `Could not parse organization from URL: ${repositoryUrl}`,
        );
        return null;
      }

      const orgName = orgMatch[1];
      const orgUrl = `https://github.com/${orgName}`;

      this.logger.log(`📋 Looking for project with organization: ${orgUrl}`);

      // Query database for project with matching organization URL
      const project =
        await this.pipelineService.findProjectByOrganization(orgUrl);

      if (project) {
        this.logger.log(`✅ Found project: ${project.id} (${project.name})`);
        return project.id;
      }

      this.logger.warn(`❌ No project found for organization: ${orgUrl}`);
      return null;
    } catch (error) {
      this.logger.error(`Error identifying project: ${error.message}`);
      return null;
    }
  }

  private async fetchAndSaveWorkflowLogs(
    payload: any,
    pipelineId: string,
    projectId: string,
  ) {
    try {
      const workflowRun = payload.workflow_run;

      // Get project to retrieve GitHub token
      const project = await this.pipelineService.findProjectById(projectId);
      if (!project || !project.token) {
        this.logger.warn(
          'Cannot fetch logs: No GitHub token found for project',
        );
        return;
      }

      // Fetch workflow jobs from GitHub API
      const jobsUrl = workflowRun.jobs_url;
      this.logger.log(`📥 Fetching workflow jobs from: ${jobsUrl}`);

      const response = await fetch(jobsUrl, {
        headers: {
          Authorization: `token ${project.token.token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        this.logger.error(`Failed to fetch workflow jobs: ${response.status}`);
        return;
      }

      const jobsData = await response.json();
      const logs = [];
      const stages = [];
      let failedStage = null;

      // Parse jobs and create log entries + stages
      for (const job of jobsData.jobs || []) {
        const stageName = this.mapJobToStage(job.name);

        // Build stages array
        stages.push({
          name: stageName,
          job_name: job.name,
          status: job.conclusion || job.status,
          started_at: job.started_at,
          completed_at: job.completed_at,
          duration:
            job.started_at && job.completed_at
              ? Math.floor(
                  (new Date(job.completed_at).getTime() -
                    new Date(job.started_at).getTime()) /
                    1000,
                )
              : null,
        });

        // Detect first failed stage
        if (job.conclusion === 'failure' && !failedStage) {
          failedStage = stageName;
        }

        // Add job-level log
        logs.push({
          pipeline_id: pipelineId,
          stage: stageName,
          level: job.conclusion === 'failure' ? 'error' : 'info',
          message: `Job "${job.name}" ${job.conclusion || job.status}`,
          metadata: {
            job_id: job.id,
            job_name: job.name,
            started_at: job.started_at,
            completed_at: job.completed_at,
            conclusion: job.conclusion,
            html_url: job.html_url,
          },
        });

        // Parse steps for failed jobs
        if (job.conclusion === 'failure' && job.steps) {
          for (const step of job.steps) {
            if (step.conclusion === 'failure') {
              logs.push({
                pipeline_id: pipelineId,
                stage: stageName,
                level: 'error',
                message: `Step "${step.name}" failed`,
                metadata: {
                  step_number: step.number,
                  step_name: step.name,
                  started_at: step.started_at,
                  completed_at: step.completed_at,
                },
              });
            }
          }
        }
      }

      // Update pipeline with stages and failed_stage
      await this.pipelineService.updatePipelineStages(pipelineId, {
        stages,
        failed_stage: failedStage,
      });
      this.logger.log(
        `✅ Updated pipeline ${pipelineId} with ${stages.length} stages`,
      );

      // Save logs to database
      if (logs.length > 0) {
        await this.pipelineService.createPipelineLogs(logs);
        this.logger.log(
          `✅ Saved ${logs.length} log entries for pipeline ${pipelineId}`,
        );
      }
    } catch (error) {
      this.logger.error(`Error fetching workflow logs: ${error.message}`);
    }
  }

  private mapJobToStage(jobName: string): string {
    const lowerName = jobName.toLowerCase();
    if (lowerName.includes('build')) return 'build';
    if (lowerName.includes('test')) return 'test';
    if (lowerName.includes('deploy')) return 'deploy';
    if (lowerName.includes('init') || lowerName.includes('setup'))
      return 'init';
    if (lowerName.includes('clean')) return 'cleanup';
    return 'build'; // default
  }
}
