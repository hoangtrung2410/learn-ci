import { DataSource } from 'typeorm';
import { DeploymentArchitectureEntity } from '../../modules/architecture/entities';

/**
 * Seed standard deployment architectures
 */
export async function seedArchitectures(dataSource: DataSource): Promise<void> {
  const architectureRepo = dataSource.getRepository(
    DeploymentArchitectureEntity,
  );

  const architectures = [
    {
      name: 'Monolithic Architecture',
      key: 'monolithic',
      description:
        'Traditional single-tier software application where all components are interconnected and interdependent',
      metadata: {
        pros: [
          'Simple to develop and deploy',
          'Easy to test end-to-end',
          'Straightforward debugging',
          'Lower operational complexity',
          'Single codebase to manage',
        ],
        cons: [
          'Limited scalability',
          'Difficult to update or modify',
          'Single point of failure',
          'Technology stack lock-in',
          'Longer deployment cycles',
        ],
        best_for: [
          'Small to medium applications',
          'MVPs and prototypes',
          'Teams with limited DevOps expertise',
          'Applications with simple business logic',
        ],
        complexity: 'low',
        scalability: 'low',
        maintenance: 'high',
        typical_ci_time: '5-15 minutes',
        typical_deployment_time: '2-5 minutes',
      },
    },
    {
      name: 'Microservices Architecture',
      key: 'microservices',
      description:
        'Architectural style that structures an application as a collection of loosely coupled services',
      metadata: {
        pros: [
          'Independent service scaling',
          'Technology diversity',
          'Fault isolation',
          'Independent deployment',
          'Team autonomy',
          'Better maintainability',
        ],
        cons: [
          'High operational complexity',
          'Distributed system challenges',
          'Network latency',
          'Data consistency issues',
          'Requires DevOps maturity',
          'Higher infrastructure costs',
        ],
        best_for: [
          'Large complex applications',
          'Teams with microservices experience',
          'High scalability requirements',
          'Independent team structures',
          'Long-term projects',
        ],
        complexity: 'high',
        scalability: 'high',
        maintenance: 'medium',
        typical_ci_time: '3-8 minutes per service',
        typical_deployment_time: '1-3 minutes per service',
      },
    },
    {
      name: 'Serverless Architecture',
      key: 'serverless',
      description:
        'Cloud computing execution model where cloud provider manages server infrastructure',
      metadata: {
        pros: [
          'No server management',
          'Automatic scaling',
          'Pay per execution',
          'Reduced operational costs',
          'Quick deployment',
          'Built-in high availability',
        ],
        cons: [
          'Cold start latency',
          'Vendor lock-in',
          'Limited execution time',
          'Debugging complexity',
          'State management challenges',
          'Cost unpredictability at scale',
        ],
        best_for: [
          'Event-driven applications',
          'Microservices with variable load',
          'API backends',
          'Batch processing',
          'Startups optimizing costs',
        ],
        complexity: 'medium',
        scalability: 'high',
        maintenance: 'low',
        typical_ci_time: '2-5 minutes',
        typical_deployment_time: '30 seconds - 2 minutes',
      },
    },
    {
      name: 'Hybrid Architecture',
      key: 'hybrid',
      description:
        'Combination of monolithic and microservices patterns, gradually decomposing monolith',
      metadata: {
        pros: [
          'Gradual migration path',
          'Risk mitigation',
          'Flexibility in service boundaries',
          'Leverage existing monolith',
          'Incremental complexity increase',
        ],
        cons: [
          'Dual operational models',
          'Complex data management',
          'Temporary technical debt',
          'Mixed deployment strategies',
          'Team coordination challenges',
        ],
        best_for: [
          'Monolith to microservices migration',
          'Organizations building microservices capability',
          'Applications with mixed requirements',
          'Risk-averse transformations',
        ],
        complexity: 'medium',
        scalability: 'medium',
        maintenance: 'medium',
        typical_ci_time: '5-12 minutes for monolith, 3-8 per service',
        typical_deployment_time: '2-5 minutes for monolith, 1-3 per service',
      },
    },
  ];

  for (const archData of architectures) {
    const existing = await architectureRepo.findOne({
      where: { key: archData.key },
    });

    if (!existing) {
      const architecture = architectureRepo.create(archData as any);
      await architectureRepo.save(architecture);
      console.log(`✅ Created architecture: ${archData.name}`);
    } else {
      console.log(`⏭️  Architecture already exists: ${archData.name}`);
    }
  }
}
