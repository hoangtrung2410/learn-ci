import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto';
import { UserEntity } from './entities/user.entity';
import { UserFactoryHelper } from './helpers/user-factory.helper';
import { UserRepository } from './repositories/user.repository';
import { AuthorizationService } from '../auth/authorization.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryPaginationDto, usersDto } from '../../common';
import { RedisHealthService } from '../redis/redis.service';
import * as bcrypt from 'bcryptjs';
import { AuthFactoryHelper } from '../auth/helpers/auth-factory.helper';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private readonly factory: UserFactoryHelper,
    private readonly userRepository: UserRepository,
    private readonly authorizationService: AuthorizationService,
    private readonly redisHealthService: RedisHealthService,
    private readonly authHelper: AuthFactoryHelper,
  ) {}

  async createUser(id, createUserDto: CreateUserDto): Promise<UserEntity> {
    try {
     
 
      const password = await bcrypt.hash(createUserDto.password, 10);
      Object.assign(createUserDto, { password: password });
      const newUser = await this.userRepository.save(
        this.userRepository.create(createUserDto as unknown as UserEntity),
      );
      return newUser;
    } catch (error) {
      this.logger.error(error?.stack);
      throw error;
    }
  }
  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    try {
      // DEBUG: Log incoming password info
      console.log('=== CREATE USER DEBUG ===');
      console.log('Incoming password type:', typeof createUserDto.password);
      console.log('Incoming password value:', createUserDto.password);
      console.log('Incoming password length:', createUserDto.password?.length);
      
      const password = this.authHelper.encryptPassword(createUserDto.password);
      const check = this.authHelper.comparePassword(createUserDto.password, password);
      console.log('Generated hash:', password,);
      console.log('Password comparison result:', check);
      console.log('=== END DEBUG ===');
      Object.assign(createUserDto, { password: password });
      const newUser = await this.userRepository.save(
        this.userRepository.create(createUserDto as unknown as UserEntity),
      );
      return newUser;
    } catch (error) {
      this.logger.error(error?.stack);
      throw error;
    }
  }

  async findOne(id: string): Promise<UserEntity> {
    try {
      const user = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .leftJoinAndSelect('role.permissions', 'permissions')
        .leftJoinAndSelect('permissions.action', 'action')
        .leftJoinAndSelect('user.createdBy', 'createdBy')
        .where('user.id = :id', { id })
        .andWhere('user.deletedAt IS NULL')
        .getOne();
      if (!user) throw new BadRequestException('USER::USER_NOT_EXIST');
      return user;
    } catch (error) {
      this.logger.error(error?.stack);
      throw error;
    }
  }

  async findOneMe(id: string) {
    try {
      const user = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .leftJoinAndSelect('role.permissions', 'permissions')
        .leftJoinAndSelect('permissions.action', 'action')
        .leftJoinAndSelect('user.createdBy', 'createdBy')
        .where('user.id = :id', { id })
        .andWhere('user.deletedAt IS NULL')
        .getOne();
      if (!user) throw new BadRequestException('USER::USER_NOT_EXIST');
      const data = {
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        deletedAt: user.deletedAt,
        name: user.name,
        email: user.email,
        role: {
          id: user.role.id,
          name: user.role.name,
          description: user.role.description,
        },
        permissions: user.role.permissions.map((p) => ({
          code: p.code,
        })),
      };
      return data;
    } catch (error) {
      this.logger.error(error?.stack);
      throw error;
    }
  }

  async findOneByEmail(email: string): Promise<UserEntity> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: email },
        relations: ['role'],
      });
      if (!user) throw new BadRequestException('USER::USER_NOT_EXIST');
      return user;
    } catch (error) {
      this.logger.error(error?.stack);
      throw error;
    }
  }
  async getAllUser(query: usersDto) {
    try {
      const hasKeyword = !!query.keyword;
      const hasRoleId = !!query.roleId;

      // cache key chỉ gồm page, limit, roleId
      const cacheKey = `users:page=${query.page}:limit=${query.limit}:roleId=${query.roleId || ''}`;

      // nếu không có keyword thì thử lấy từ cache
      if (!hasKeyword) {
        const cached = await this.redisHealthService.getData(cacheKey);
        if (cached) return cached;
      }

      const qb = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .leftJoinAndSelect('role.permissions', 'permissions')
        .leftJoinAndSelect('permissions.action', 'action')
        .leftJoinAndSelect('user.createdBy', 'createdBy')
        .where('user.deletedAt IS NULL AND user.isActive = true');

      if (hasKeyword) {
        qb.andWhere(
          '(user.name LIKE :keyword OR user.fullName LIKE :keyword)',
          { keyword: `%${query.keyword}%` },
        );
      }

      if (hasRoleId) {
        qb.andWhere('role.id = :roleId', { roleId: query.roleId });
      }

      const [items, totalItems] = await qb
        .orderBy('user.createdAt', 'DESC')
        .skip((query.page - 1) * query.limit)
        .take(query.limit)
        .getManyAndCount();

      const totalPages = Math.ceil(totalItems / query.limit);
      const data = {
        items,
        paging: {
          totalItems,
          itemCount: items.length,
          itemsPerPage: query.limit,
          totalPages,
          currentPage: query.page,
        },
      };

      if (!hasKeyword) {
        await this.redisHealthService.setData(cacheKey, data, 300);
      }

      return data;
    } catch (error) {
      this.logger.error(error?.stack);
      throw error;
    }
  }

  async getAllUserDelete(query: QueryPaginationDto) {
    try {
      const hasKeyword = query.keyword ? true : false;
      const cacheKey = `users:page=${query.page}:limit=${query.limit}`;

      // if (!hasKeyword) {
      //   const cached = await this.redisHealthService.getData(cacheKey);
      //   console.log('cached', true);
      //   if (cached) return cached;
      // }
      const qb = this.userRepository
        .createQueryBuilder('user')
        .withDeleted()
        .leftJoinAndSelect('user.role', 'role')
        .leftJoinAndSelect('role.permissions', 'permissions')
        .leftJoinAndSelect('permissions.action', 'action')
        .leftJoinAndSelect('user.createdBy', 'createdBy')
        .where('user.deletedAt IS NOT NULL');

      if (hasKeyword) {
        qb.andWhere(
          '(user.name LIKE :keyword OR user.fullName LIKE :keyword)',
          {
            keyword: `%${query.keyword}%`,
          },
        );
      }

      const [items, totalItems] = await qb
        .orderBy('user.createdAt', 'DESC')
        .skip((query.page - 1) * query.limit)
        .take(query.limit)
        .getManyAndCount();

      const totalPages = Math.ceil(totalItems / query.limit);
      const data = {
        items,
        paging: {
          totalItems,
          itemCount: items.length,
          itemsPerPage: query.limit,
          totalPages,
          currentPage: query.page,
        },
      };

      // if (!hasKeyword) {
      //   await this.redisHealthService.setData(cacheKey, data, 300);
      // }

      return data;
    } catch (error) {
      this.logger.error(error?.stack);
      throw error;
    }
  }

  async deleteUser(id: string) {
    try {
      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        throw new BadRequestException('USER::USER_NOT_EXIST');
      }
      user.deletedAt = new Date();
      await this.userRepository.save(user);
      return { message: 'USER::DELETE_USER_SUCCESS' };
    } catch (error) {
      this.logger.error(error?.stack);
      throw error;
    }
  }

  async restoreUser(id: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        withDeleted: true,
      });
      if (!user) {
        throw new BadRequestException('USER::USER_NOT_EXIST');
      }
      user.deletedAt = null;
      return await this.userRepository.save(user);
    } catch (error) {
      this.logger.error(error?.stack);
      throw error;
    }
  }

  async updatePassword(id: string, password: string, isLogout: boolean) {
    try {
      const user = await this.userRepository.findOneBy({ id });
      if (isLogout) {
        user.password = await bcrypt.hash(password, 10);
        user.lastUpdatePasswordAt = Math.floor(new Date().getTime() / 1000);
        await this.userRepository.save(user);
      } else {
        user.password = await bcrypt.hash(password, 10);
        await this.userRepository.save(user);
      }
      return { message: 'USER::UPDATE_PASSWORD_SUCCESS' };
    } catch (error) {
      this.logger.error(error?.stack);
      throw error;
    }
  }

  async updateProfile(userId: string, payload: UpdateUserDto) {
    // try {
    //   const user = await this.userRepository.findOne({ where: { id: userId } });
    //   if (!user) {
    //     throw new BadRequestException('USER::USER_NOT_EXIST');
    //   }
    //   if (payload.roleId) {
    //     const role = await this.authorizationService.getRole(payload.roleId);
    //     user.role = role;
    //   }
    //   Object.assign(user, payload);
    //   await this.userRepository.save(user);
    //   return { message: 'USER::UPDATE_PROFILE_SUCCESS' };
    // } catch (error) {
    //   this.logger.error(error?.stack);
    //   throw error;
    // }
  }
}
