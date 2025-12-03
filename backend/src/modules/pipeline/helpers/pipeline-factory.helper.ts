import { Injectable } from '@nestjs/common';
import {
  PipelineEntity,
  PipelineStatus,
  PipelineTrigger,
} from '../entities/pipeline.entity';

@Injectable()
export class PipelineFactoryHelper {
  createPipelineFromWebhook(
    webhookData: any,
    projectId: string,
  ): Partial<PipelineEntity> {
    // Generic webhook data processor
    // This can be extended to handle GitHub, GitLab, Bitbucket webhooks
    return {
      name:
        webhookData.pipeline_name || webhookData.workflow_name || 'Pipeline',
      status: this.mapStatus(webhookData.status),
      trigger: this.mapTrigger(webhookData.trigger || webhookData.event),
      branch: webhookData.branch || webhookData.ref?.replace('refs/heads/', ''),
      commit_sha:
        webhookData.commit_sha || webhookData.sha || webhookData.after,
      commit_message:
        webhookData.commit_message || webhookData.head_commit?.message,
      author:
        webhookData.author ||
        webhookData.pusher?.name ||
        webhookData.sender?.login,
      repository_url:
        webhookData.repository_url || webhookData.repository?.html_url,
      stages: webhookData.stages || webhookData.jobs,
      metadata: webhookData.metadata || {},
      project_id: projectId,
    };
  }

  createPipelineFromGitHub(
    githubData: any,
    projectId: string,
  ): Partial<PipelineEntity> {
    const workflowRun = githubData.workflow_run || githubData;

    const timingData = this.extractGitHubTiming(workflowRun);
    const serviceType = this.determineServiceType(githubData.repository);

    const leadTime =
      workflowRun.run_started_at && workflowRun.updated_at
        ? Math.floor(
            (new Date(workflowRun.updated_at).getTime() -
              new Date(workflowRun.run_started_at).getTime()) /
              1000,
          )
        : undefined;

    return {
      name: workflowRun.name || 'GitHub Workflow',
      status: this.mapGitHubStatus(workflowRun.status, workflowRun.conclusion),
      trigger: this.mapTrigger(workflowRun.event),
      branch: workflowRun.head_branch,
      commit_sha: workflowRun.head_sha,
      commit_message: workflowRun.head_commit?.message,
      author: workflowRun.head_commit?.author?.name || githubData.sender?.login,
      repository_url: githubData.repository?.html_url,
      started_at: workflowRun.run_started_at
        ? new Date(workflowRun.run_started_at)
        : undefined,
      finished_at: workflowRun.updated_at
        ? new Date(workflowRun.updated_at)
        : undefined,
      duration: leadTime,
      build_time: timingData.buildTime,
      test_time: timingData.testTime,
      deploy_time: timingData.deployTime,
      lead_time: leadTime,
      is_failed_deployment: workflowRun.conclusion === 'failure',
      metadata: {
        workflow_id: workflowRun.workflow_id,
        run_number: workflowRun.run_number,
        run_attempt: workflowRun.run_attempt,
        html_url: workflowRun.html_url,
        jobs_url: workflowRun.jobs_url,
      },
      project_id: projectId,
    };
  }

  private extractGitHubTiming(workflowRun: any): {
    buildTime?: number;
    testTime?: number;
    deployTime?: number;
  } {
    return {
      buildTime: undefined,
      testTime: undefined,
      deployTime: undefined,
    };
  }

  private determineServiceType(repository: any): any {
    const repoName = repository?.name?.toLowerCase() || '';

    if (
      repoName.includes('service') ||
      repoName.includes('api') ||
      repoName.includes('gateway')
    ) {
      return 'microservices';
    }

    // Default to monolithic
    return 'monolithic';
  }

  createPipelineFromGitLab(
    gitlabData: any,
    projectId: string,
  ): Partial<PipelineEntity> {
    // GitLab CI/CD specific processor
    const pipeline = gitlabData.object_attributes || gitlabData;

    return {
      name: `Pipeline #${pipeline.id}`,
      status: this.mapGitLabStatus(pipeline.status),
      trigger: this.mapTrigger(pipeline.source),
      branch: pipeline.ref,
      commit_sha: pipeline.sha,
      author: gitlabData.user?.name || pipeline.user?.name,
      repository_url: gitlabData.project?.web_url,
      started_at: pipeline.created_at
        ? new Date(pipeline.created_at)
        : undefined,
      finished_at: pipeline.finished_at
        ? new Date(pipeline.finished_at)
        : undefined,
      duration: pipeline.duration,
      stages: pipeline.stages,
      metadata: {
        pipeline_id: pipeline.id,
        web_url: pipeline.web_url,
      },
      project_id: projectId,
    };
  }

  private mapStatus(status: string): PipelineStatus {
    if (!status) return PipelineStatus.PENDING;

    const statusMap: Record<string, PipelineStatus> = {
      pending: PipelineStatus.PENDING,
      queued: PipelineStatus.PENDING,
      running: PipelineStatus.RUNNING,
      in_progress: PipelineStatus.RUNNING,
      success: PipelineStatus.SUCCESS,
      completed: PipelineStatus.SUCCESS,
      failed: PipelineStatus.FAILED,
      failure: PipelineStatus.FAILED,
      error: PipelineStatus.FAILED,
      cancelled: PipelineStatus.CANCELLED,
      canceled: PipelineStatus.CANCELLED,
      skipped: PipelineStatus.SKIPPED,
    };

    return statusMap[status.toLowerCase()] || PipelineStatus.PENDING;
  }

  private mapGitHubStatus(status: string, conclusion?: string): PipelineStatus {
    if (status === 'completed') {
      const conclusionMap: Record<string, PipelineStatus> = {
        success: PipelineStatus.SUCCESS,
        failure: PipelineStatus.FAILED,
        cancelled: PipelineStatus.CANCELLED,
        skipped: PipelineStatus.SKIPPED,
      };
      return conclusionMap[conclusion?.toLowerCase()] || PipelineStatus.SUCCESS;
    }

    return this.mapStatus(status);
  }

  private mapGitLabStatus(status: string): PipelineStatus {
    const statusMap: Record<string, PipelineStatus> = {
      created: PipelineStatus.PENDING,
      waiting_for_resource: PipelineStatus.PENDING,
      preparing: PipelineStatus.PENDING,
      pending: PipelineStatus.PENDING,
      running: PipelineStatus.RUNNING,
      success: PipelineStatus.SUCCESS,
      failed: PipelineStatus.FAILED,
      canceled: PipelineStatus.CANCELLED,
      skipped: PipelineStatus.SKIPPED,
      manual: PipelineStatus.PENDING,
    };

    return statusMap[status?.toLowerCase()] || PipelineStatus.PENDING;
  }

  private mapTrigger(trigger: string): PipelineTrigger {
    if (!trigger) return PipelineTrigger.PUSH;

    const triggerMap: Record<string, PipelineTrigger> = {
      push: PipelineTrigger.PUSH,
      pull_request: PipelineTrigger.PULL_REQUEST,
      merge_request: PipelineTrigger.PULL_REQUEST,
      manual: PipelineTrigger.MANUAL,
      workflow_dispatch: PipelineTrigger.MANUAL,
      schedule: PipelineTrigger.SCHEDULE,
      tag: PipelineTrigger.TAG,
      tag_push: PipelineTrigger.TAG,
    };

    return triggerMap[trigger.toLowerCase()] || PipelineTrigger.PUSH;
  }
}
