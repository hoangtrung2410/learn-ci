import {
  Controller,
  Get,
  Query,
  Res,
  Req,
  HttpStatus,
  Post,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { RegisterDto } from './dto/authencation/register.dto';
import { Response, Request } from 'express';
import { AuthenticationService } from './authentication.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/authencation';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Get('github')
  @ApiOperation({
    summary: 'Redirect to GitHub OAuth',
    description: 'Redirects user to GitHub for OAuth authentication',
  })
  @ApiResponse({ status: 302, description: 'Redirect to GitHub OAuth page' })
  redirectToGithub(@Res() res: Response): void {
    const url = this.authService.getGithubLoginUrl();
    res.redirect(url);
    return;
  }

  @Get('github/url')
  @ApiOperation({
    summary: 'Get GitHub OAuth URL',
    description: 'Returns the GitHub OAuth login URL without redirecting',
  })
  @ApiResponse({
    status: 200,
    description: 'GitHub OAuth URL',
    schema: {
      example: { url: 'https://github.com/login/oauth/authorize?...' },
    },
  })
  getGithubUrl() {
    return { url: this.authService.getGithubLoginUrl() };
  }

  @Get('github/callback')
  @ApiOperation({
    summary: 'GitHub OAuth callback',
    description: 'Handles the OAuth callback from GitHub',
  })
  @ApiQuery({
    name: 'code',
    description: 'Authorization code from GitHub',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'User authenticated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid authorization code',
  })
  async githubCallback(@Query('code') code: string) {
    return this.authService.validateGithubLogin(code);
  }

  @Post('register')
  @ApiOperation({
    summary: 'Register new user',
    description: 'Create a new user account',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'User already exists',
  })
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user and return access token',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: { id: 'uuid', email: 'user@example.com' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }
}
