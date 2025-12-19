import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { SessionGuard } from '../auth/session.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { RequestLike } from '../types/http';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(SessionGuard)
  me(@Req() req: RequestLike) {
    return this.usersService.getProfile(req.user!.id);
  }

  @Get('children')
  @UseGuards(SessionGuard, RolesGuard)
  @Roles(Role.parent, Role.admin)
  children(@Req() req: RequestLike) {
    return this.usersService.listChildren(req.user!.id);
  }

  @Get('patients')
  @UseGuards(SessionGuard, RolesGuard)
  @Roles(Role.practitioner, Role.admin)
  patients(@Req() req: RequestLike) {
    return this.usersService.listPractitionerPatients(req.user!.id);
  }

  @Get('admin/overview')
  @UseGuards(SessionGuard, RolesGuard)
  @Roles(Role.admin)
  adminOverview() {
    return this.usersService.listUsersForAdmin();
  }

  @Post('consents')
  @UseGuards(SessionGuard, RolesGuard)
  @Roles(Role.parent, Role.admin)
  createConsent(@Req() req: RequestLike, @Body() body: unknown) {
    return this.usersService.recordConsent(req.user!, body);
  }
}
