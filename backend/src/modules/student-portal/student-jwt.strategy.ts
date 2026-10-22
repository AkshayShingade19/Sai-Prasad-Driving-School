import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface StudentJwtPayload {
  sub: string;
  email: string;
  name: string;
  type: 'student';
}

/**
 * Separate JWT strategy for student portal sessions.
 * Shares the signing secret with staff tokens but requires `type: 'student'`.
 */
@Injectable()
export class StudentJwtStrategy extends PassportStrategy(Strategy, 'student-jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'change-this-secret-in-production'),
    });
  }

  async validate(payload: StudentJwtPayload) {
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      type: 'student',
    };
  }
}
