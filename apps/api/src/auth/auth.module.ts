import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma.module';
import { SessionGuard } from './session.guard';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, SessionGuard, RolesGuard],
  exports: [AuthService, SessionGuard, RolesGuard],
})
export class AuthModule {}
