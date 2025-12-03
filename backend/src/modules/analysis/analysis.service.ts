import { Injectable, Logger } from '@nestjs/common';
import { AnalysisRepository } from './repositories/analysis.repository';
import { MetricsService } from '../pipeline/services/metrics.service';
import {
  AnalysisEntity,
  AnalysisType,
  RecommendationPriority,
} from './entities/analysis.entity';

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  constructor(
    private readonly analysisRepository: AnalysisRepository,
    private readonly metricsService: MetricsService,
  ) { }

  /**
   * Run automated analysis for a project
   */
  async analyzeProject(
    projectId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AnalysisEntity> {
    this.logger.log(
      `Running analysis for project ${projectId} from ${startDate} to ${endDate}`,
    );

    // Get performance metrics
    const metrics = await this.metricsService.calculatePerformanceMetrics(
      projectId,
      startDate,
      endDate,
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(metrics);

    // Create analysis entity
    const analysis = this.analysisRepository.create({
      type: AnalysisType.PERFORMANCE,
      title: `Performance Analysis - ${new Date().toLocaleDateString()}`,
      description: `Automated CI/CD performance analysis for the period ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      metrics,
      recommendations,
      analysis_period_start: startDate,
      analysis_period_end: endDate,
      project_id: projectId,
    });

    return await this.analysisRepository.save(analysis);
  }

  /**
   * Compare architectures and recommend best option
   */
  async compareArchitectures(
    startDate: Date,
    endDate: Date,
  ): Promise<AnalysisEntity> {
    this.logger.log('Comparing monolithic vs microservices architectures');
    const comparison = await this.metricsService.compareArchitectureTypes(
      startDate,
      endDate,
    );

    const recommended = this.determineRecommendedArchitecture(comparison);
    const recommendations = this.generateArchitectureRecommendations(comparison);

    // Create analysis entity
    const analysis = this.analysisRepository.create({
      type: AnalysisType.ARCHITECTURE,
      title: `Architecture Comparison - ${new Date().toLocaleDateString()}`,
      description: `Automated architecture comparison for the period ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,

      metrics: comparison,
      recommendations,
      recommended_architecture: recommended.architecture as AnalysisType,
      potential_improvement_percentage: recommended.improvementPercentage,
      analysis_period_start: startDate,
      analysis_period_end: endDate,
    });

    return await this.analysisRepository.save(analysis);
  }

  /**
   * Generate optimization recommendations for build process
   */
  private generateRecommendations(metrics: any): any[] {
    const recommendations = [];

    // Build time optimization
    if (metrics.averageBuildTime > 600) {
      // > 10 minutes
      recommendations.push({
        title: 'Optimize Build Time',
        description:
          'Build time is taking longer than 10 minutes. Consider implementing Docker layer caching, dependency caching, and parallel builds.',
        priority: RecommendationPriority.HIGH,
        impact: 'High - Can reduce build time by 40-60%',
        effort: 'Medium - 2-3 days',
        category: 'build',
      });
    }

    // Test time optimization
    if (metrics.averageTestTime > 300) {
      // > 5 minutes
      recommendations.push({
        title: 'Optimize Test Execution',
        description:
          'Test execution is slow. Implement test parallelization, reduce integration tests, use test coverage optimization.',
        priority: RecommendationPriority.HIGH,
        impact: 'High - Can reduce test time by 50-70%',
        effort: 'Medium - 3-5 days',
        category: 'test',
      });
    }

    // Deployment optimization
    if (metrics.averageDeployTime > 180) {
      // > 3 minutes
      recommendations.push({
        title: 'Optimize Deployment Process',
        description:
          'Deployment is taking too long. Consider blue-green deployments, incremental rollouts, or optimizing container image sizes.',
        priority: RecommendationPriority.MEDIUM,
        impact: 'Medium - Can reduce deploy time by 30-40%',
        effort: 'High - 5-7 days',
        category: 'deploy',
      });
    }

    // Success rate improvement
    if (metrics.successRate < 80) {
      recommendations.push({
        title: 'Improve Pipeline Stability',
        description:
          'Success rate is below 80%. Add better error handling, implement retry logic, fix flaky tests.',
        priority: RecommendationPriority.CRITICAL,
        impact: 'Critical - Improve developer productivity',
        effort: 'High - 7-10 days',
        category: 'build',
      });
    }

    // DORA metrics recommendations
    if (metrics.leadTimeForChanges > 24) {
      // > 24 hours
      recommendations.push({
        title: 'Reduce Lead Time for Changes',
        description:
          'Lead time is over 24 hours. Optimize CI/CD pipeline, reduce manual approvals, implement automated testing.',
        priority: RecommendationPriority.HIGH,
        impact: 'High - Faster feature delivery',
        effort: 'Medium - 3-5 days',
        category: 'architecture',
      });
    }

    if (metrics.deploymentFrequency < 1) {
      // < 1 per day
      recommendations.push({
        title: 'Increase Deployment Frequency',
        description:
          'Deploy less than once per day. Implement continuous deployment, reduce batch sizes, improve automated testing.',
        priority: RecommendationPriority.MEDIUM,
        impact: 'Medium - Faster feedback cycles',
        effort: 'High - 5-10 days',
        category: 'architecture',
      });
    }

    if (metrics.changeFailureRate > 15) {
      // > 15%
      recommendations.push({
        title: 'Reduce Change Failure Rate',
        description:
          'Change failure rate is above 15%. Improve testing coverage, add canary deployments, implement feature flags.',
        priority: RecommendationPriority.HIGH,
        impact: 'High - Reduce production incidents',
        effort: 'High - 7-14 days',
        category: 'test',
      });
    }

    // Cache optimization
    if (metrics.averageBuildTime > 300) {
      recommendations.push({
        title: 'Implement Advanced Caching',
        description:
          'Enable GitHub Actions cache for dependencies, Docker layer cache, and build artifacts to speed up builds.',
        priority: RecommendationPriority.MEDIUM,
        impact: 'Medium - 20-30% faster builds',
        effort: 'Low - 1-2 days',
        category: 'cache',
      });
    }

    return recommendations;
  }

  /**
   * Generate architecture-specific recommendations
   */
  private generateArchitectureRecommendations(comparison: any): any[] {
    const recommendations = [];
    const { monolithic, microservices, comparison: compData } = comparison;

    // Build time comparison
    if (microservices.averageBuildTime < monolithic.averageBuildTime * 0.7) {
      recommendations.push({
        title: 'Consider Microservices for Build Performance',
        description: `Microservices architecture shows ${compData.buildTimeImprovement} faster build times due to smaller codebases and parallel builds.`,
        priority: RecommendationPriority.HIGH,
        impact: 'High - Significantly faster CI/CD',
        effort: 'High - Major architectural change',
        category: 'architecture',
      });
    }

    // Deploy time comparison
    if (microservices.averageDeployTime < monolithic.averageDeployTime * 0.6) {
      recommendations.push({
        title: 'Microservices Enable Independent Deployments',
        description: `Microservices show ${compData.deployTimeImprovement} faster deployments. Teams can deploy services independently without affecting others.`,
        priority: RecommendationPriority.MEDIUM,
        impact: 'High - Independent team velocity',
        effort: 'High - Requires service decomposition',
        category: 'architecture',
      });
    }

    // Success rate comparison
    if (monolithic.successRate > microservices.successRate + 10) {
      recommendations.push({
        title: 'Monolithic Shows Higher Stability',
        description: `Monolithic architecture has ${monolithic.successRate}% success rate vs ${microservices.successRate}% for microservices. Consider staying monolithic if team is small.`,
        priority: RecommendationPriority.MEDIUM,
        impact: 'Medium - Simpler operations',
        effort: 'Low - Maintain current architecture',
        category: 'architecture',
      });
    }

    // Overall recommendation from comparison
    recommendations.push({
      title: 'Architecture Recommendation',
      description: compData.recommendation,
      priority: RecommendationPriority.HIGH,
      impact: 'Strategic - Long-term architecture decision',
      effort: 'Varies based on current state',
      category: 'architecture',
    });

    return recommendations;
  }

  /**
   * Determine recommended architecture based on metrics
   */
  private determineRecommendedArchitecture(comparison: any): {
    architecture: 'monolithic' | 'microservices';
    improvementPercentage: number;
  } {
    const { monolithic, microservices } = comparison;

    // Score based on multiple factors
    let monolithicScore = 0;
    let microservicesScore = 0;

    // Build time (weight: 3)
    if (microservices.averageBuildTime < monolithic.averageBuildTime) {
      microservicesScore += 3;
    } else {
      monolithicScore += 3;
    }

    // Deploy time (weight: 3)
    if (microservices.averageDeployTime < monolithic.averageDeployTime) {
      microservicesScore += 3;
    } else {
      monolithicScore += 3;
    }

    // Success rate (weight: 4)
    if (microservices.successRate > monolithic.successRate) {
      microservicesScore += 4;
    } else {
      monolithicScore += 4;
    }

    // Total pipeline time (weight: 2)
    if (microservices.totalPipelineTime < monolithic.totalPipelineTime) {
      microservicesScore += 2;
    } else {
      monolithicScore += 2;
    }

    const architecture =
      microservicesScore > monolithicScore
        ? 'microservices'
        : 'monolithic';

    const improvementPercentage =
      architecture === 'microservices'
        ? this.calculateImprovementPercentage(monolithic, microservices)
        : this.calculateImprovementPercentage(microservices, monolithic);

    return {
      architecture,
      improvementPercentage,
    };
  }

  private calculateImprovementPercentage(baseline: any, target: any): number {
    const buildImprovement =
      ((baseline.averageBuildTime - target.averageBuildTime) /
        baseline.averageBuildTime) *
      100;
    const deployImprovement =
      ((baseline.averageDeployTime - target.averageDeployTime) /
        baseline.averageDeployTime) *
      100;
    const successImprovement = target.successRate - baseline.successRate;

    return Number(
      ((buildImprovement + deployImprovement + successImprovement) / 3).toFixed(
        2,
      ),
    );
  }

  /**
   * Get all analyses for a project
   */
  async getProjectAnalyses(projectId: string): Promise<AnalysisEntity[]> {
    return this.analysisRepository.find({
      where: { project_id: projectId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get latest analysis
   */
  async getLatestAnalysis(
    projectId?: string,
    type?: AnalysisType,
  ): Promise<AnalysisEntity | null> {
    const queryBuilder = this.analysisRepository
      .createQueryBuilder('analysis')
      .leftJoinAndSelect('analysis.project', 'project')
      .orderBy('analysis.createdAt', 'DESC');

    if (projectId) {
      queryBuilder.andWhere('analysis.project_id = :projectId', { projectId });
    }

    if (type) {
      queryBuilder.andWhere('analysis.type = :type', { type });
    }

    return queryBuilder.getOne();
  }

  /**
   * Get analysis by ID
   */
  async getAnalysisById(id: string): Promise<AnalysisEntity | null> {
    return this.analysisRepository.findOne({
      where: { id },
      relations: ['project'],
    });
  }
}
