import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ProjectRepository } from './repositories/project.repository';
import { TokenRepository } from '../token/repositories/token.repository';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationDto } from '../../database/dto/pagination.dto';
import { ProjectEntity } from './entities/project.entity';
import { In } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly configService: ConfigService,
  ) { }

  async create(data: CreateProjectDto): Promise<ProjectEntity> {
    this.logger.log(`Creating project ${data.name}`);

    try {
      if (!data.tokenId) {
        throw new NotFoundException(`Token ID is required`);
      }

      const token = await this.tokenRepository.findOne({
        where: { id: data.tokenId },
      });

      if (!token) {
        throw new NotFoundException(`Token with ID ${data.tokenId} not found`);
      }

      const project = new ProjectEntity();
      project.name = data.name;
      project.description = data.description;
      project.url_organization = data.url_organization;
      project.token_id = token.id;

      const createdProject = await this.projectRepository.save(project);
      await this.createGitHubWebhook(createdProject, token.token);

      return createdProject;
    } catch (error) {
      this.logger.error(error.stack);
      throw error;
    }
  }

  async update(id: string, data: UpdateProjectDto): Promise<ProjectEntity> {
    this.logger.log(`Updating project ${id}`);
    try {
      const project = await this.projectRepository.findOne({ where: { id } });
      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }
      if (data.tokenId) {
        const token = await this.tokenRepository.findOne({
          where: { id: data.tokenId },
        });
        if (!token) {
          throw new NotFoundException(
            `Token with ID ${data.tokenId} not found`,
          );
        }
        project.token_id = data.tokenId;
      }

      if (data.name) project.name = data.name;
      if (data.description) project.description = data.description;
      if (data.url_organization)
        project.url_organization = data.url_organization;

      return await this.projectRepository.save(project);
    } catch (error) {
      this.logger.error(error?.stack);
      throw error;
    }
  }

  async delete(id: string) {
    this.logger.log(`Deleting project ${id}`);
    try {
      return this.projectRepository.delete(id);
    } catch (error) {
      this.logger.error(error?.stack);
      throw error;
    }
  }

  async getDetail(id: string) {
    this.logger.log(`Getting project ${id}`);
    return this.projectRepository.findOne({
      where: { id },
      relations: ['token', 'pipelines', 'analyses'],
    });
  }

  async getAll(data: PaginationDto) {
    this.logger.log(`Getting all projects`);
    try {
      const [projects, total] = await this.projectRepository.findAndCount({
        skip: data.offset,
        take: data.limit,
        relations: ['token', 'pipelines', 'analyses'],
        order: {
          createdAt: 'DESC',
        },
      });

      return {
        projects,
        total,
        page: Math.floor(data.offset / data.limit) + 1,
        limit: data.limit,
        totalPages: Math.ceil(total / data.limit),
      };
    } catch (error) {
      this.logger.error(error?.stack);
      throw error;
    }
  }

  async createGitHubWebhook(project: ProjectEntity, token?: string) {
    this.logger.log(
      `Creating GitHub ORGANIZATION webhook for project ${project.id}`,
    );

    try {
      const orgName = this.parseGitHubOrgUrl(project.url_organization);
      this.logger.log(
        `📋 Parsed organization name: "${orgName}" from URL: "${project.url_organization}"`,
      );

      if (!orgName) {
        throw new BadRequestException(
          'Invalid GitHub organization URL. Expected format: https://github.com/organization-name',
        );
      }

      const webhookUrl = `${this.configService.get('app.url')}/api/v1/webhooks/github`;
      const isOrgCheck = await fetch(`https://api.github.com/orgs/${orgName}`, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!isOrgCheck.ok) {
        this.logger.warn(
          `⚠️ "${orgName}" is not a GitHub Organization or token lacks access. Cannot create organization webhook.`,
        );
        throw new BadRequestException(
          `"${orgName}" is not a valid GitHub Organization. ` +
          'Organization webhooks can only be created for GitHub Organizations (not personal accounts). ' +
          'If this is a personal account, you need to specify a repository URL instead.',
        );
      }
      const events = [
        'workflow_run',
        'deployment',
        'push',
        'pull_request',
        'release',
      ];
      const active = true;
      const secret = this.generateWebhookSecret();
      const apiUrl = `https://api.github.com/orgs/${orgName}/hooks`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'web',
          active: active,
          events: events,
          config: {
            url: webhookUrl,
            content_type: 'json',
            secret: secret,
            insecure_ssl: '0',
          },
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        if (error.message?.includes('Not Found')) {
          throw new BadRequestException(
            'Organization not found or token does not have admin:org_hook permission. ' +
            'Make sure your token has "admin:org_hook" scope and the organization name is correct.',
          );
        }
        throw new BadRequestException(
          error.message || 'Failed to create organization webhook on GitHub',
        );
      }
      const webhookData = await response.json();
      project.github_webhook_id = webhookData.id;
      project.github_webhook_url = webhookData.config.url;
      project.github_webhook_active = webhookData.active;
      project.github_webhook_created_at = new Date(webhookData.created_at);

      await this.projectRepository.save(project);

      return {
        success: true,
        message: `GitHub organization webhook created successfully for "${orgName}"`,
        webhook: {
          id: webhookData.id,
          organization: orgName,
          url: webhookData.config.url,
          events: webhookData.events,
          active: webhookData.active,
          created_at: webhookData.created_at,
        },
        secret: secret,
        note: `✅ This webhook will receive events from ALL repositories in the "${orgName}" organization`,
      };
    } catch (error) {
      this.logger.error(`Failed to create webhook: ${error.message}`);
      throw error;
    }
  }

  private parseGitHubOrgUrl(url: string): string | null {
    try {
      // Match: https://github.com/org-name
      const httpsRegex = /github\.com\/([^\/]+)\/?$/;
      // Match: git@github.com:org-name
      const sshRegex = /git@github\.com:([^\/]+)\/?$/;

      let match = url.match(httpsRegex) || url.match(sshRegex);

      if (match) {
        return match[1];
      }

      return null;
    } catch (error) {
      this.logger.error(
        `Failed to parse GitHub organization URL: ${error.message}`,
      );
      return null;
    }
  }

  /**
   * Generate random webhook secret (32 characters)
   */
  private generateWebhookSecret(): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  async getGitHubWebhooks(projectId: string) {
    this.logger.log(
      `Getting GitHub organization webhooks for project ${projectId}`,
    );

    try {
      const project = await this.projectRepository.findOne({
        where: { id: projectId },
        relations: ['token'],
      });

      if (!project) {
        throw new NotFoundException(`Project with ID ${projectId} not found`);
      }

      if (!project.token) {
        throw new BadRequestException('Project must have a token');
      }

      const orgName = this.parseGitHubOrgUrl(project.url_organization);
      if (!orgName) {
        throw new BadRequestException('Invalid GitHub organization URL');
      }

      const response = await fetch(
        `https://api.github.com/orgs/${orgName}/hooks`,
        {
          method: 'GET',
          headers: {
            Authorization: `token ${project.token.token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new BadRequestException(
          error.message || 'Failed to fetch webhooks',
        );
      }

      const webhooks = await response.json();

      return {
        success: true,
        webhooks: webhooks.map((hook: any) => ({
          id: hook.id,
          url: hook.config.url,
          events: hook.events,
          active: hook.active,
          created_at: hook.created_at,
          updated_at: hook.updated_at,
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to get webhooks: ${error.message}`);
      throw error;
    }
  }

  async deleteGitHubWebhook(projectId: string, webhookId: number) {
    this.logger.log(
      `Deleting GitHub ORGANIZATION webhook ${webhookId} for project ${projectId}`,
    );

    try {
      const project = await this.projectRepository.findOne({
        where: { id: projectId },
        relations: ['token'],
      });

      if (!project) {
        throw new NotFoundException(`Project with ID ${projectId} not found`);
      }

      if (!project.token) {
        throw new BadRequestException('Project must have a token');
      }

      const orgName = this.parseGitHubOrgUrl(project.url_organization);
      if (!orgName) {
        throw new BadRequestException('Invalid GitHub organization URL');
      }

      const response = await fetch(
        `https://api.github.com/orgs/${orgName}/hooks/${webhookId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `token ${project.token.token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new BadRequestException(
          error.message || 'Failed to delete organization webhook',
        );
      }

      project.github_webhook_id = null;
      project.github_webhook_url = null;
      project.github_webhook_active = false;
      project.github_webhook_created_at = null;

      await this.projectRepository.save(project);
      this.logger.log(
        `💾 Webhook info cleared from database for project ${projectId}`,
      );

      return {
        success: true,
        message: 'Organization webhook deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to delete webhook: ${error.message}`);
      throw error;
    }
  }
}
