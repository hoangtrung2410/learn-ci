import { Controller, Get, Query, Res, Req, HttpStatus } from '@nestjs/common'
import { Response, Request } from 'express'
import { AuthenticationService } from './authentication.service'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

@Controller('auth')
export class OAuthController {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  @Get('github')
  redirectToGithub(@Res() res: Response) {
    const url = this.authService.getGithubLoginUrl()
    return res.redirect(url)
  }

  @Get('github/callback')
  async githubCallback(@Query('code') code: string, @Res() res: Response, @Req() req: Request) {
    if (!code) {
      return res.status(HttpStatus.BAD_REQUEST).send('Missing code')
    }

    try {
      const profile = await this.authService.validateGithubLogin(code)

      // Build an app JWT (recommended instead of sending raw GitHub token)
      const jwtPayload = {
        sub: profile.id || profile.email || profile.login || 'github_user',
        email: profile.email,
        name: profile.name || profile.login,
      }

      const jwtOptions = this.configService.get('jwt') || {}
      const expiresIn = jwtOptions.accessTokenExpiresIn || '1h'

      const appToken = this.jwtService.sign(jwtPayload, { expiresIn })

      // Render minimal HTML page that posts token to opener and then closes
      const origin = req.get('origin') || ''
      const safeToken = JSON.stringify(appToken)
      const html = `<!doctype html>
<html>
  <head><meta charset="utf-8" /></head>
  <body>
    <script>
      (function(){
        try {
          // Prefer sending to opener origin if possible
          var target = window.opener ? window.opener.location.origin : '*'
          window.opener && window.opener.postMessage({ type: 'oauth', token: ${safeToken} }, target)
        } catch(e) {
          try { localStorage.setItem('token', ${safeToken}) } catch (e) {}
        }
        setTimeout(function(){ window.close() }, 600)
      })();
    </script>
    <p>Đang xử lý đăng nhập...</p>
  </body>
</html>`

      res.setHeader('Content-Type', 'text/html')
      return res.send(html)
    } catch (err) {
      console.error('GitHub callback failed', err)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('OAuth failure')
    }
  }
}
