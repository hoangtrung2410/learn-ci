import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';
import { STRATEGY_JWT_AUTH } from '../constants/auth.constant';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(
  Strategy,
  STRATEGY_JWT_AUTH,
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    const publicKeyBase64 = configService.get<string>('JWT_PUBLIC_KEY_BASE64');

    if (!publicKeyBase64) {
      throw new Error('Missing JWT_PUBLIC_KEY_BASE64 in environment variables');
    }
    const publicKey = Buffer.from(publicKeyBase64, 'base64').toString('utf8');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: publicKey,
      algorithms: ['RS256'],
    });
  }
  async validate(payload: any) {
    const user = await this.userService.findOne(payload.sub);
    const tokenIssueAt = payload.issuedAt; // issuedAt
    const passwordLastUpdated = user.lastUpdatePasswordAt;
    console.log(passwordLastUpdated);
    if (user.deletedAt !== null || passwordLastUpdated > tokenIssueAt) {
      throw new UnauthorizedException('AUTH::INVALID_TOKEN_OR_TOKEN_EXPIRE');
    }

    return payload;
  }
}
