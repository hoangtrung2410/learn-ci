import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import {
  PipelineEntity,
  PipelineStatus,
  PipelineTrigger,
  ServiceType,
} from '../../modules/pipeline/entities/pipeline.entity';
import { ProjectEntity } from '../../modules/projects/entities/project.entity';
import { DeploymentArchitectureEntity } from '../../modules/architecture/entities/deployment-architecture.entity';

export default class PipelineSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const pipelineRepository = dataSource.getRepository(PipelineEntity);
    const projectRepository = dataSource.getRepository(ProjectEntity);
    const architectureRepository = dataSource.getRepository(
      DeploymentArchitectureEntity,
    );

    // Check if pipelines already exist
    const existingPipelines = await pipelineRepository.count();
    if (existingPipelines > 0) {
      console.log('🔄 Pipelines already seeded, skipping...');
      return;
    }

    const projects = await projectRepository.find();
    const architectures = await architectureRepository.find();

    if (projects.length === 0) {
      console.log('⚠️  No projects found, please seed projects first');
      return;
    }

    const branches = ['main', 'develop', 'feature/add-auth', 'hotfix/bug-123'];
    const authors = [
      'john.dev@example.com',
      'jane.smith@example.com',
      'alice.johnson@example.com',
    ];
    const commitMessages = [
      'Add new feature for user authentication',
      'Fix critical bug in payment processing',
      'Update dependencies and security patches',
      'Refactor database queries for performance',
      'Add unit tests for order service',
      'Implement caching layer',
      'Fix memory leak in data processor',
      'Update API documentation',
      'Add CI/CD pipeline configuration',
      'Optimize build process',
    ];

    const statuses = [
      PipelineStatus.SUCCESS,
      PipelineStatus.SUCCESS,
      PipelineStatus.SUCCESS,
      PipelineStatus.FAILED,
      PipelineStatus.SUCCESS,
    ];

    const now = new Date();
    const pipelines = [];

    // Generate pipelines for each project
    for (const project of projects) {
      const projectArchitecture = architectures.find(
        (a) => a.id === project.architecture_id,
      );

      // Determine service type based on architecture
      let serviceType = ServiceType.MONOLITHIC;
      if (projectArchitecture?.key === 'MICROSERVICES') {
        serviceType = ServiceType.MICROSERVICES;
      } else if (projectArchitecture?.key === 'SERVERLESS') {
        serviceType = ServiceType.HYBRID;
      }

      // Generate 15-30 pipelines per project (last 30 days)
      const pipelineCount = Math.floor(Math.random() * 16) + 15;

      for (let i = 0; i < pipelineCount; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const startedAt = new Date(now);
        startedAt.setDate(startedAt.getDate() - daysAgo);
        startedAt.setHours(
          Math.floor(Math.random() * 24),
          Math.floor(Math.random() * 60),
        );

        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const isSuccess = status === PipelineStatus.SUCCESS;

        // Duration varies by service type
        let baseDuration = 300; // 5 minutes in seconds
        if (serviceType === ServiceType.MICROSERVICES) {
          baseDuration = 180; // 3 minutes
        } else if (serviceType === ServiceType.HYBRID) {
          baseDuration = 120; // 2 minutes
        }

        const duration = baseDuration + Math.floor(Math.random() * 300);
        const buildTime = Math.floor(duration * 0.4);
        const testTime = Math.floor(duration * 0.3);
        const deployTime = Math.floor(duration * 0.3);

        const finishedAt = new Date(startedAt);
        finishedAt.setSeconds(finishedAt.getSeconds() + duration);

        const leadTime = duration + Math.floor(Math.random() * 600); // Add review/approval time

        const pipeline = {
          name: `Pipeline #${i + 1} - ${project.name}`,
          status,
          trigger:
            i % 5 === 0
              ? PipelineTrigger.MANUAL
              : i % 7 === 0
                ? PipelineTrigger.SCHEDULE
                : PipelineTrigger.PUSH,
          service_type: serviceType,
          branch: branches[Math.floor(Math.random() * branches.length)],
          commit_sha: Math.random().toString(36).substring(2, 10),
          commit_message:
            commitMessages[Math.floor(Math.random() * commitMessages.length)],
          author: authors[Math.floor(Math.random() * authors.length)],
          repository_url: project.url_organization,
          started_at: startedAt,
          finished_at: finishedAt,
          duration,
          build_time: buildTime,
          test_time: testTime,
          deploy_time: deployTime,
          lead_time: leadTime,
          is_failed_deployment: !isSuccess,
          is_rollback: !isSuccess && Math.random() > 0.7,
          error_message: !isSuccess
            ? 'Build failed: Unit tests failed with 3 errors'
            : null,
          artifact_size_mb: Math.floor(Math.random() * 500) + 50,
          artifact_storage_cost: (Math.random() * 5).toFixed(2),
          project_id: project.id,
          architecture_id: project.architecture_id,
          stages: {
            checkout: { status: 'success', duration: 10 },
            build: {
              status: isSuccess ? 'success' : 'failed',
              duration: buildTime,
            },
            test: {
              status: isSuccess ? 'success' : 'failed',
              duration: testTime,
            },
            deploy: {
              status: isSuccess ? 'success' : 'skipped',
              duration: deployTime,
            },
          },
          metadata: {
            runner: 'GitHub Actions',
            node_version: '20.x',
            os: 'ubuntu-latest',
          },
        };

        pipelines.push(pipeline);
      }
    }

    // Save all pipelines
    for (const pipelineData of pipelines) {
      const pipeline = pipelineRepository.create(pipelineData);
      await pipelineRepository.save(pipeline);
    }

    console.log(`✅ ${pipelines.length} pipelines seeded successfully`);
  }
}
