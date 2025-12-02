import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import {
  AnalysisEntity,
  AnalysisType,
  RecommendationPriority,
} from '../../modules/analysis/entities/analysis.entity';
import { ProjectEntity } from '../../modules/projects/entities/project.entity';
import { ServiceType } from '../../modules/pipeline/entities/pipeline.entity';

export default class AnalysisSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const analysisRepository = dataSource.getRepository(AnalysisEntity);
    const projectRepository = dataSource.getRepository(ProjectEntity);

    // Check if analyses already exist
    const existingAnalyses = await analysisRepository.count();
    if (existingAnalyses > 0) {
      console.log('📊 Analyses already seeded, skipping...');
      return;
    }

    const projects = await projectRepository.find();

    if (projects.length === 0) {
      console.log('⚠️  No projects found, please seed projects first');
      return;
    }

    const now = new Date();
    const analyses = [];

    // Create performance analyses for each project
    for (const project of projects) {
      const periodStart = new Date(now);
      periodStart.setDate(periodStart.getDate() - 30);

      // Performance Analysis
      const performanceAnalysis = {
        type: AnalysisType.PERFORMANCE,
        title: `Performance Analysis - ${project.name}`,
        description: `Comprehensive performance analysis for ${project.name} covering the last 30 days`,
        metrics: {
          dora: {
            deployment_frequency: (Math.random() * 10 + 2).toFixed(2),
            lead_time_for_changes: Math.floor(Math.random() * 48 + 4),
            mean_time_to_recovery: Math.floor(Math.random() * 120 + 10),
            change_failure_rate: (Math.random() * 20 + 5).toFixed(2),
          },
          cicd: {
            total_pipelines: Math.floor(Math.random() * 100 + 50),
            success_rate: (Math.random() * 20 + 75).toFixed(2),
            average_duration: Math.floor(Math.random() * 300 + 120),
            failed_pipelines: Math.floor(Math.random() * 20 + 5),
          },
          performance: {
            average_build_time: Math.floor(Math.random() * 200 + 60),
            average_test_time: Math.floor(Math.random() * 150 + 40),
            average_deploy_time: Math.floor(Math.random() * 100 + 30),
            cache_hit_rate: (Math.random() * 30 + 60).toFixed(2),
          },
        },
        comparison_data: {}, // Empty object for performance analysis
        recommendations: [
          {
            title: 'Optimize Build Process',
            description:
              'Implement build caching to reduce build time by 40-50%',
            priority: RecommendationPriority.HIGH,
            impact: 'High - Can reduce build time by ~2 minutes',
            effort: 'Medium - Requires CI/CD configuration changes',
            category: 'build',
          },
          {
            title: 'Parallelize Test Execution',
            description: 'Run unit tests in parallel to speed up test phase',
            priority: RecommendationPriority.MEDIUM,
            impact: 'Medium - Can reduce test time by 30-40%',
            effort: 'Low - Minor test configuration changes',
            category: 'test',
          },
          {
            title: 'Implement Incremental Deployments',
            description: 'Use blue-green or canary deployment strategies',
            priority: RecommendationPriority.MEDIUM,
            impact: 'High - Reduces deployment risk and downtime',
            effort: 'High - Requires infrastructure changes',
            category: 'deploy',
          },
        ],
        project_id: project.id,
        analysis_period_start: periodStart,
        analysis_period_end: now,
      };

      analyses.push(performanceAnalysis);
    }

    // Create architecture comparison analysis
    const comparisonPeriodStart = new Date(now);
    comparisonPeriodStart.setDate(comparisonPeriodStart.getDate() - 30);

    const architectureComparison = {
      type: AnalysisType.COMPARISON,
      title: 'Architecture Performance Comparison',
      description:
        'Comparative analysis of Monolithic vs Microservices vs Serverless architectures',
      metrics: {
        summary: {
          total_projects_analyzed: projects.length,
          analysis_period_days: 30,
        },
      },
      comparison_data: {
        monolithic: {
          projects_count: projects.filter((p) =>
            p.architecture_id?.includes('MONOLITHIC'),
          ).length,
          avg_deployment_frequency: 2.5,
          avg_lead_time: 48,
          avg_build_time: 320,
          avg_success_rate: 82.5,
          avg_recovery_time: 180,
        },
        microservices: {
          projects_count: projects.filter((p) =>
            p.architecture_id?.includes('MICROSERVICES'),
          ).length,
          avg_deployment_frequency: 8.2,
          avg_lead_time: 12,
          avg_build_time: 180,
          avg_success_rate: 88.3,
          avg_recovery_time: 45,
        },
        serverless: {
          projects_count: projects.filter((p) =>
            p.architecture_id?.includes('SERVERLESS'),
          ).length,
          avg_deployment_frequency: 15.5,
          avg_lead_time: 6,
          avg_build_time: 90,
          avg_success_rate: 91.7,
          avg_recovery_time: 15,
        },
      },
      recommended_architecture: ServiceType.MICROSERVICES,
      potential_improvement_percentage: 45.5,
      recommendations: [
        {
          title: 'Consider Microservices Migration',
          description:
            'Projects using monolithic architecture could benefit from gradual migration to microservices',
          priority: RecommendationPriority.HIGH,
          impact:
            'High - Can improve deployment frequency by 3x and reduce lead time by 75%',
          effort: 'Very High - Requires significant architectural changes',
          category: 'architecture',
        },
        {
          title: 'Adopt Serverless for Event-Driven Workloads',
          description:
            'Use serverless architecture for data processing and event-driven tasks',
          priority: RecommendationPriority.MEDIUM,
          impact:
            'High - Reduces infrastructure costs and improves scalability',
          effort: 'Medium - Requires refactoring specific components',
          category: 'architecture',
        },
        {
          title: 'Implement Service Mesh',
          description:
            'Add service mesh for better observability and traffic management in microservices',
          priority: RecommendationPriority.LOW,
          impact: 'Medium - Improves monitoring and debugging capabilities',
          effort: 'High - Requires infrastructure setup and training',
          category: 'architecture',
        },
      ],
      analysis_period_start: comparisonPeriodStart,
      analysis_period_end: now,
    };

    analyses.push(architectureComparison);

    // Create optimization analysis
    const optimizationAnalysis = {
      type: AnalysisType.OPTIMIZATION,
      title: 'CI/CD Pipeline Optimization Opportunities',
      description: 'Analysis of optimization opportunities across all projects',
      metrics: {
        potential_savings: {
          time_saved_per_day: 245, // minutes
          cost_saved_per_month: 1250, // USD
          efficiency_gain: 35.5, // percentage
        },
        current_bottlenecks: {
          slow_builds: Math.floor(projects.length * 0.4),
          inefficient_tests: Math.floor(projects.length * 0.6),
          deployment_delays: Math.floor(projects.length * 0.3),
        },
      },
      comparison_data: {}, // Empty object for optimization analysis
      recommendations: [
        {
          title: 'Implement Docker Layer Caching',
          description:
            'Enable Docker layer caching to speed up builds across all projects',
          priority: RecommendationPriority.HIGH,
          impact: 'High - Can reduce build time by 50-70%',
          effort: 'Low - Simple CI/CD configuration',
          category: 'cache',
        },
        {
          title: 'Optimize Dependency Installation',
          description: 'Use dependency caching and lock files effectively',
          priority: RecommendationPriority.HIGH,
          impact: 'Medium - Can save 1-2 minutes per build',
          effort: 'Low - Add caching configuration',
          category: 'build',
        },
        {
          title: 'Split Test Suites',
          description: 'Separate fast unit tests from slow integration tests',
          priority: RecommendationPriority.MEDIUM,
          impact: 'Medium - Faster feedback for developers',
          effort: 'Medium - Requires test restructuring',
          category: 'test',
        },
      ],
      potential_improvement_percentage: 35.5,
      analysis_period_start: comparisonPeriodStart,
      analysis_period_end: now,
    };

    analyses.push(optimizationAnalysis);

    // Save all analyses
    for (const analysisData of analyses) {
      const analysis = analysisRepository.create(analysisData);
      await analysisRepository.save(analysis);
    }

    console.log(`✅ ${analyses.length} analyses seeded successfully`);
  }
}
