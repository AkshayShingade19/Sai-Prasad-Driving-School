import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class StudentAuthGuard extends AuthGuard('student-jwt') {
  handleRequest(err: any, user: any, _info: any, _context: ExecutionContext, _status: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired session');
    }
    if (user.type !== 'student') {
      throw new UnauthorizedException('Invalid or expired session');
    }
    return user;
  }
}
