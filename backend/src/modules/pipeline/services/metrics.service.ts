import { Injectable, Logger } from '@nestjs/common';
import { PipelineRepository } from '../repositories/pipeline.repository';
import { PipelineStatus, ServiceType } from '../entities/pipeline.entity';
import { Between, In } from 'typeorm';
import { MetricsHelper } from '../../../common';

export interface DORAMetrics {
  leadTimeForChanges: number; // Average time from commit to production (hours)
  deploymentFrequency: number; // Deployments per day
  changeFailureRate: number; // Percentage of failed deployments
  meanTimeToRestore: number; // Average time to recover from failure (hours)
}

export interface CICDMetrics {
  averageBuildTime: number; // seconds
  averageTestTime: number; // seconds
  averageDeployTime: number; // seconds
  totalPipelineTime: number; // seconds
  successRate: number; // percentage
  totalPipelines: number;
  successfulPipelines: number;
  failedPipelines: number;
}

export interface PerformanceMetrics extends DORAMetrics, CICDMetrics {
  serviceType: ServiceType;
  projectId: string;
  period: {
    from: Date;
    to: Date;
  };
}

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(private readonly pipelineRepository: PipelineRepository) {}

  /**
   * Calculate DORA metrics for a project
   */
  async calculateDORAMetrics(
    projectId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<DORAMetrics> {
    this.logger.log(
      `Calculating DORA metrics for project ${projectId} from ${startDate} to ${endDate}`,
    );

    const pipelines = await this.pipelineRepository.find({
      where: {
        project_id: projectId,
        createdAt: Between(startDate, endDate),
        status: In([PipelineStatus.SUCCESS, PipelineStatus.FAILED]),
      },
      order: { createdAt: 'ASC' },
    });

    // Lead Time for Changes (commit to deploy)
    const leadTimes = pipelines
      .filter((p) => p.lead_time && p.status === PipelineStatus.SUCCESS)
      .map((p) => p.lead_time);
    const leadTimeForChanges = leadTimes.length
      ? leadTimes.reduce((sum, time) => sum + time, 0) / leadTimes.length / 3600
      : 0; // Convert to hours

    // Deployment Frequency
    const successfulDeployments = pipelines.filter(
      (p) => p.status === PipelineStatus.SUCCESS,
    ).length;
    const daysDiff =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const deploymentFrequency =
      daysDiff > 0 ? successfulDeployments / daysDiff : 0;

    // Change Failure Rate
    const failedDeployments = pipelines.filter(
      (p) => p.is_failed_deployment || p.status === PipelineStatus.FAILED,
    ).length;
    const changeFailureRate =
      pipelines.length > 0 ? (failedDeployments / pipelines.length) * 100 : 0;

    // Mean Time to Restore (MTTR)
    const mttrTimes = await this.calculateMTTR(pipelines);
    const meanTimeToRestore =
      mttrTimes.length > 0
        ? mttrTimes.reduce((sum, time) => sum + time, 0) / mttrTimes.length
        : 0;

    return {
      leadTimeForChanges: Number(leadTimeForChanges.toFixed(2)),
      deploymentFrequency: Number(deploymentFrequency.toFixed(2)),
      changeFailureRate: Number(changeFailureRate.toFixed(2)),
      meanTimeToRestore: Number(meanTimeToRestore.toFixed(2)),
    };
  }

  /**
   * Calculate CI/CD performance metrics
   */
  async calculateCICDMetrics(
    projectId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CICDMetrics> {
    this.logger.log(
      `Calculating CI/CD metrics for project ${projectId} from ${startDate} to ${endDate}`,
    );

    const pipelines = await this.pipelineRepository.find({
      where: {
        project_id: projectId,
        createdAt: Between(startDate, endDate),
      },
    });

    const totalPipelines = pipelines.length;
    const successfulPipelines = pipelines.filter(
      (p) => p.status === PipelineStatus.SUCCESS,
    ).length;
    const failedPipelines = pipelines.filter(
      (p) => p.status === PipelineStatus.FAILED,
    ).length;

    // Calculate average times
    const buildTimes = pipelines
      .filter((p) => p.build_time)
      .map((p) => p.build_time);
    const testTimes = pipelines
      .filter((p) => p.test_time)
      .map((p) => p.test_time);
    const deployTimes = pipelines
      .filter((p) => p.deploy_time)
      .map((p) => p.deploy_time);
    const durations = pipelines
      .filter((p) => p.duration)
      .map((p) => p.duration);

    const averageBuildTime = this.calculateAverage(buildTimes);
    const averageTestTime = this.calculateAverage(testTimes);
    const averageDeployTime = this.calculateAverage(deployTimes);
    const totalPipelineTime = this.calculateAverage(durations);

    const successRate =
      totalPipelines > 0 ? (successfulPipelines / totalPipelines) * 100 : 0;

    return {
      averageBuildTime: Number(averageBuildTime.toFixed(2)),
      averageTestTime: Number(averageTestTime.toFixed(2)),
      averageDeployTime: Number(averageDeployTime.toFixed(2)),
      totalPipelineTime: Number(totalPipelineTime.toFixed(2)),
      successRate: Number(successRate.toFixed(2)),
      totalPipelines,
      successfulPipelines,
      failedPipelines,
    };
  }

  /**
   * Calculate complete performance metrics
   */
  async calculatePerformanceMetrics(
    projectId: string,
    startDate: Date,
    endDate: Date,
    serviceType?: ServiceType,
  ): Promise<PerformanceMetrics> {
    const [doraMetrics, cicdMetrics] = await Promise.all([
      this.calculateDORAMetrics(projectId, startDate, endDate),
      this.calculateCICDMetrics(projectId, startDate, endDate),
    ]);

    // Determine service type if not provided
    let determinedServiceType = serviceType;
    if (!determinedServiceType) {
      const pipeline = await this.pipelineRepository.findOne({
        where: { project_id: projectId },
      });
      determinedServiceType = pipeline?.service_type || ServiceType.MONOLITHIC;
    }

    return {
      ...doraMetrics,
      ...cicdMetrics,
      serviceType: determinedServiceType,
      projectId,
      period: {
        from: startDate,
        to: endDate,
      },
    };
  }

  /**
   * Compare metrics between service types
   */
  async compareServiceTypes(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    monolithic: Partial<PerformanceMetrics>;
    microservices: Partial<PerformanceMetrics>;
    comparison: any;
  }> {
    this.logger.log('Comparing service types performance');

    const [monolithicPipelines, microservicesPipelines] = await Promise.all([
      this.pipelineRepository.find({
        where: {
          service_type: ServiceType.MONOLITHIC,
          createdAt: Between(startDate, endDate),
        },
      }),
      this.pipelineRepository.find({
        where: {
          service_type: ServiceType.MICROSERVICES,
          createdAt: Between(startDate, endDate),
        },
      }),
    ]);

    const monolithicMetrics =
      this.calculateMetricsFromPipelines(monolithicPipelines);
    const microservicesMetrics = this.calculateMetricsFromPipelines(
      microservicesPipelines,
    );

    const comparison = {
      buildTimeImprovement:
        this.calculateImprovement(
          monolithicMetrics.averageBuildTime,
          microservicesMetrics.averageBuildTime,
        ) + '%',
      deployTimeImprovement:
        this.calculateImprovement(
          monolithicMetrics.averageDeployTime,
          microservicesMetrics.averageDeployTime,
        ) + '%',
      successRateImprovement:
        this.calculateImprovement(
          microservicesMetrics.successRate,
          monolithicMetrics.successRate,
        ) + '%',
      recommendation: this.generateRecommendation(
        monolithicMetrics,
        microservicesMetrics,
      ),
    };

    return {
      monolithic: { ...monolithicMetrics, serviceType: ServiceType.MONOLITHIC },
      microservices: {
        ...microservicesMetrics,
        serviceType: ServiceType.MICROSERVICES,
      },
      comparison,
    };
  }

  /**
   * Get performance trends over time
   */
  async getPerformanceTrends(
    projectId: string,
    startDate: Date,
    endDate: Date,
    interval: 'day' | 'week' | 'month' = 'day',
  ) {
    const pipelines = await this.pipelineRepository.find({
      where: {
        project_id: projectId,
        createdAt: Between(startDate, endDate),
      },
      order: { createdAt: 'ASC' },
    });

    const trends = [];
    const intervalMs = this.getIntervalMs(interval);
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const nextDate = new Date(currentDate.getTime() + intervalMs);
      const periodPipelines = pipelines.filter(
        (p) => p.createdAt >= currentDate && p.createdAt < nextDate,
      );

      const metrics = this.calculateMetricsFromPipelines(periodPipelines);

      trends.push({
        date: currentDate.toISOString().split('T')[0],
        ...metrics,
      });

      currentDate = nextDate;
    }

    return trends;
  }

  // Helper methods

  private calculateMTTR(pipelines: any[]): number[] {
    const mttrTimes: number[] = [];

    for (let i = 0; i < pipelines.length; i++) {
      if (pipelines[i].is_failed_deployment) {
        // Find next successful deployment
        for (let j = i + 1; j < pipelines.length; j++) {
          if (
            pipelines[j].status === PipelineStatus.SUCCESS &&
            !pipelines[j].is_failed_deployment
          ) {
            const timeToRestore =
              (pipelines[j].finished_at?.getTime() -
                pipelines[i].finished_at?.getTime()) /
              (1000 * 60 * 60); // Convert to hours
            mttrTimes.push(timeToRestore);
            break;
          }
        }
      }
    }

    return mttrTimes;
  }

  private calculateAverage(values: number[]): number {
    return MetricsHelper.calculateAverage(values);
  }

  private calculateMetricsFromPipelines(pipelines: any[]): any {
    const totalPipelines = pipelines.length;
    const successfulPipelines = pipelines.filter(
      (p) => p.status === PipelineStatus.SUCCESS,
    ).length;
    const failedPipelines = pipelines.filter(
      (p) => p.status === PipelineStatus.FAILED,
    ).length;

    const buildTimes = pipelines
      .filter((p) => p.build_time)
      .map((p) => p.build_time);
    const testTimes = pipelines
      .filter((p) => p.test_time)
      .map((p) => p.test_time);
    const deployTimes = pipelines
      .filter((p) => p.deploy_time)
      .map((p) => p.deploy_time);
    const durations = pipelines
      .filter((p) => p.duration)
      .map((p) => p.duration);

    return {
      averageBuildTime: Number(this.calculateAverage(buildTimes).toFixed(2)),
      averageTestTime: Number(this.calculateAverage(testTimes).toFixed(2)),
      averageDeployTime: Number(this.calculateAverage(deployTimes).toFixed(2)),
      totalPipelineTime: Number(this.calculateAverage(durations).toFixed(2)),
      successRate:
        totalPipelines > 0
          ? Number(((successfulPipelines / totalPipelines) * 100).toFixed(2))
          : 0,
      totalPipelines,
      successfulPipelines,
      failedPipelines,
    };
  }

  private calculateImprovement(baseline: number, target: number): string {
    return MetricsHelper.calculateImprovement(baseline, target).toFixed(2);
  }

  private generateRecommendation(monolithic: any, microservices: any): string {
    const reasons: string[] = [];

    if (microservices.averageBuildTime < monolithic.averageBuildTime) {
      reasons.push('faster build times');
    }
    if (microservices.successRate > monolithic.successRate) {
      reasons.push('higher success rate');
    }
    if (microservices.averageDeployTime < monolithic.averageDeployTime) {
      reasons.push('faster deployments');
    }

    if (reasons.length >= 2) {
      return `Microservices architecture recommended: ${reasons.join(', ')}`;
    } else if (monolithic.successRate > microservices.successRate) {
      return `Monolithic architecture recommended: more stable and simpler`;
    } else {
      return `Both architectures perform similarly. Consider team size and complexity.`;
    }
  }

  private getIntervalMs(interval: 'day' | 'week' | 'month'): number {
    switch (interval) {
      case 'day':
        return 24 * 60 * 60 * 1000;
      case 'week':
        return 7 * 24 * 60 * 60 * 1000;
      case 'month':
        return 30 * 24 * 60 * 60 * 1000;
    }
  }
}
