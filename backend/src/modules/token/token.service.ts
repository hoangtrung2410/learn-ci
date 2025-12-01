import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { TokenRepository } from './repositories/token.repository';
import { PaginationDto } from '../../database/dto/pagination.dto';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  constructor(private readonly tokenRepository: TokenRepository) {}

  async create(data: CreateTokenDto) {
    this.logger.log(`Creating token for project: ${data.name}`);
    try {
      const newToken = await this.tokenRepository.save(
        this.tokenRepository.create(data),
      );
      return newToken;
    } catch (error) {
      this.logger.error(error?.stack);
      throw error;
    }
  }

  async update(id: string, data: UpdateTokenDto) {
    this.logger.log(`Updating token ${id}`);
    try {
      const existing = await this.tokenRepository.findOne({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`Token ${id} not found`);
      }
      Object.assign(existing, data);
      const saved = await this.tokenRepository.save(existing);
      return saved;
    } catch (error) {
      this.logger.error(error?.stack);
      throw error;
    }
  }

  delete(id: string) {
    this.logger.log(`Deleting token ${id}`);
    try {
      return this.tokenRepository.delete(id);
    } catch (error) {
      this.logger.error(error?.stack);
      throw error;
    }
  }

  getDetail(id: string) {
    this.logger.log(`Getting token ${id}`);
    try {
      return this.tokenRepository.findOne({ where: { id } });
    } catch (error) {
      this.logger.error(error?.stack);
      throw error;
    }
  }
  getAll(data: PaginationDto) {
    this.logger.log(`Getting all tokens`);
    try {
      return this.tokenRepository.find({
        skip: data.offset,
        take: data.limit,
      });
    } catch (error) {
      this.logger.error(error?.stack);
      throw error;
    }
  }
}
