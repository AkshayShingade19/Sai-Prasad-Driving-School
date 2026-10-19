import { ConfigService } from '@nestjs/config';

export const jwtConstantsFactory = (config: ConfigService) => ({
  secret: config.get<string>('JWT_SECRET', 'change-this-secret-in-production'),
  expiresIn: config.get<string>('JWT_EXPIRES_IN', '7d'),
});
