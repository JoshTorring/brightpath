import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SessionGuard } from './session.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { Role } from '@prisma/client';
import { RequestLike, ResponseLike } from '../types/http';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: unknown) {
    return this.authService.register(body);
  }

  @Post('verify')
  verify(@Body() body: unknown) {
    return this.authService.verifyEmail(body);
  }

  @Post('login')
  login(@Body() body: unknown, @Res({ passthrough: true }) res: ResponseLike, @Req() req: RequestLike) {
    return this.authService.login(body, res, req);
  }

  @Post('logout')
  logout(@Req() req: RequestLike, @Res({ passthrough: true }) res: ResponseLike) {
    const token = this.authService.readSessionCookie(req) || req.sessionToken;
    return this.authService.logout(token, res);
  }

  @Get('me')
  @UseGuards(SessionGuard)
  me(@Req() req: RequestLike) {
    return req.user;
  }

  @Get('admin-check')
  @UseGuards(SessionGuard, RolesGuard)
  @Roles(Role.admin)
  adminCheck() {
    return { ok: true, scope: 'admin' };
  }
}
