import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestLike } from '../types/http';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestLike>();
    const token = this.authService.readSessionCookie(request);

    if (!token) {
      throw new UnauthorizedException('Missing session cookie');
    }

    const sessionUser = await this.authService.validateSession(token);
    request.user = sessionUser.user;
    request.sessionToken = token;
    request.sessionId = sessionUser.sessionId;

    return true;
  }
}
