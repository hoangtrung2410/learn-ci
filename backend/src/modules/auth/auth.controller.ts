import { Controller, Get, Query, Res, Req, HttpStatus } from '@nestjs/common'
import { Response, Request } from 'express'
import { AuthenticationService } from './authentication.service'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Get('github')
  redirectToGithub(@Res() res: Response): void {
    const url = this.authService.getGithubLoginUrl()
    res.redirect(url)
    return
  }

  @Get('github/url')
  getGithubUrl() {
    return { url: this.authService.getGithubLoginUrl() }
  }

  @Get('github/callback')
  async githubCallback(
    @Query('code') code: string,
  ) {
   return this.authService.validateGithubLogin(code); 
  }
}

