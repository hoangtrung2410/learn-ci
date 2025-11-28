import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from './dto/authencation';
import { AuthFactoryHelper } from './helpers/auth-factory.helper';
import { IJwtRefreshPayload, IPreJwtPayload } from './interfaces';
import { UserEntity } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto';
import { ChangePwdDto } from './dto/authencation/change-password.dto';
import { AuthorizationService } from './authorization.service';
import { Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);
  private readonly clientID: string
  private readonly clientSecret: string
  private readonly callbackUrl: string
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly authFactory: AuthFactoryHelper,
    private readonly authHelper: AuthFactoryHelper,
    private readonly authorizationService: AuthorizationService,
  ) {
    this.clientID = process.env.GITHUB_CLIENT_ID || this.configService.get<string>('GITHUB_CLIENT_ID') || ''
    this.clientSecret = process.env.GITHUB_CLIENT_SECRET || this.configService.get<string>('GITHUB_CLIENT_SECRET') || ''
    this.callbackUrl = process.env.GITHUB_CALLBACK_URL || this.configService.get<string>('GITHUB_CALLBACK_URL') || 'http://localhost:5173'
  }

  getGithubLoginUrl(): string {
    const scopes = ['read:user', 'user:email'];
    return `https://github.com/login/oauth/authorize?client_id=${this.clientID}&redirect_uri=${this.callbackUrl}&scope=${scopes.join(' ')}`;
  }

   async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;
      const user = await this.validateUser(email, password);
      if (!user) {
        throw new UnauthorizedException('AUTH::EMAIL_OR_PASS_INCORRECT');
      }
      const issuedTime = Math.floor(new Date().getTime() / 1000);
      const subject: IJwtRefreshPayload = {
        sub: user.id,
        issuedAt: issuedTime,
      };
      const payload: IPreJwtPayload = {
        sub: user.id,
        issuedAt: issuedTime,
        pol: 'allow_all_policy',
        name: user.name,
        ...plainToInstance(UserEntity, user),
      };

      return {
        refreshToken: this.jwtService.sign(subject, {
          expiresIn: this.configService.get(
            'authentication.refreshTokenExpiresInSec',
          ),
        }),
        accessToken: this.jwtService.sign(
          { ...payload },
          {
            expiresIn: this.configService.get(
              'authentication.accessTokenExpiresInSec',
            ),
          },
        ),
      };
    } catch (error) {
      this.logger.error(error?.stack);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('AUTH::LOGIN_FAILED', error.message);
    }
  }

  async register(createUserDto: CreateUserDto): Promise<UserEntity> {
    try {
      return await this.userService.create(createUserDto);
    } catch (error) {
      this.logger.error(error?.stack);
      throw new BadRequestException('AUTH::REGISTER_FAILED', error.message);
    }
  }

  async validateGithubLogin(code: string): Promise<any> {
    try {
      const tokenResponse = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: this.clientID,
          client_secret: this.clientSecret,
          code: code,
        },
        {
          headers: { Accept: 'application/json' },
        },
      );


      const accessToken = tokenResponse.data.access_token;
      if (!accessToken) {
        throw new UnauthorizedException('Invalid verification code');
      }

      const userResponse = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const emailResponse = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      const primaryEmail = emailResponse.data.find((e: any) => e.primary && e.verified)?.email;

      return {
        ...userResponse.data,
        email: primaryEmail || userResponse.data.email,
        access_token: accessToken 
      };

    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('GitHub authentication failed');
    }
  }



 
 

  async validateUser(email: string, password: string): Promise<UserEntity> {
    try {
      const user = await this.userService.findOneByEmail(email);

      if (!user) {
        throw new UnauthorizedException('AUTH::EMAIL_OR_PASS_INCORRECT');
      }
      console.log('Validating password', user.password);
      const check = this.authHelper.comparePassword(password, user.password);
      console.log('Password valid:', check);
      if (!check) {
        throw new UnauthorizedException('AUTH::EMAIL_OR_PASS_INCORRECT');
      }
      return user;
    } catch (error) {
      this.logger.error(error?.stack);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException(
        'AUTH::VALIDATE_USER_FAILED',
        error.message,
      );
    }
  }
}
