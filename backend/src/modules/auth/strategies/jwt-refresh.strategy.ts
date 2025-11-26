import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';
import { STRATEGY_JWT_REFRESH } from '../constants/auth.constant';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  STRATEGY_JWT_REFRESH,
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    // super({
    //   jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
    //   secretOrKey: configService.get<string>('jwt.publicKey'),
    //   algorithms: ['RS256'],
    // });
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
    const passwordLastUpdated = user.lastUpdatePasswordAt;

    if (user.deletedAt !== null || passwordLastUpdated > payload.issuedAt)
      throw new UnauthorizedException('AUTH::INVALID_TOKEN_OR_TOKEN_EXPIRE');

    // Passport automatically creates a user object, based on the value we return from the validate() method,
    // and assigns it to the Request object as req.user
    return payload;
  }
}
