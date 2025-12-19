import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Role, User } from '@prisma/client';
import { randomBytes, createHash, scrypt, timingSafeEqual } from 'crypto';
import { z } from 'zod';
import { SessionUser } from './auth.types';
import { promisify } from 'util';
import { RequestLike, ResponseLike } from '../types/http';

const scryptAsync = promisify(scrypt);

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string(),
  role: z.nativeEnum(Role),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const verifySchema = z.object({
  email: z.string().email(),
  token: z.string().min(16),
});

@Injectable()
export class AuthService {
  private readonly sessionCookieName = process.env.SESSION_COOKIE_NAME || 'bp_session';
  private readonly sessionTtlMs = Number(process.env.SESSION_TTL_DAYS || '7') * 24 * 60 * 60 * 1000;

  constructor(private readonly prisma: PrismaService) {}

  async register(payload: unknown) {
    const data = registerSchema.parse(payload);
    const passwordIssues = this.passwordIssues(data.password);
    if (passwordIssues.length) {
      throw new BadRequestException({ message: 'Password does not meet policy', issues: passwordIssues });
    }

    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const passwordHash = await this.hashPassword(data.password);
    const token = this.generateToken();
    const hashedToken = this.hashToken(token);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role,
        passwordHash,
        emailVerificationToken: hashedToken,
        verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: this.toSessionUser(user, 0),
      verificationToken: token,
      message: 'Account created. Check your email for a verification link.',
    };
  }

  async verifyEmail(payload: unknown) {
    const data = verifySchema.parse(payload);
    const tokenHash = this.hashToken(data.token);

    const user = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !user.emailVerificationToken) {
      throw new BadRequestException('No verification request found for this email');
    }

    if (user.emailVerificationToken !== tokenHash) {
      throw new BadRequestException('Verification token is invalid');
    }

    if (user.verificationTokenExpiresAt && user.verificationTokenExpiresAt < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        emailVerificationToken: null,
        verificationTokenExpiresAt: null,
      },
    });

    return { verified: true };
  }

  async login(payload: unknown, res: ResponseLike, req: RequestLike) {
    const data = loginSchema.parse(payload);
    const user = await this.prisma.user.findUnique({ where: { email: data.email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await this.verifyPassword(data.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.emailVerifiedAt) {
      throw new ForbiddenException('Please verify your email before signing in.');
    }

    const sessionToken = this.generateToken();
    const hashedToken = this.hashToken(sessionToken);
    const expiresAt = new Date(Date.now() + this.sessionTtlMs);
    const userAgentHeader = req.headers['user-agent'];
    const userAgent = Array.isArray(userAgentHeader) ? userAgentHeader[0] : userAgentHeader;

    await this.prisma.$transaction([
      this.prisma.session.create({
        data: {
          tokenHash: hashedToken,
          userId: user.id,
          expiresAt,
          userAgent,
          ipAddress: req.ip,
        },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      }),
    ]);

    this.attachSessionCookie(res, sessionToken, expiresAt);

    const consentCount = await this.prisma.consentRecord.count({
      where: { actorUserId: user.id, revokedAt: null },
    });

    return { user: this.toSessionUser(user, consentCount) };
  }

  async logout(sessionToken: string | undefined, res: ResponseLike) {
    if (sessionToken) {
      const hashedToken = this.hashToken(sessionToken);
      await this.prisma.session.deleteMany({ where: { tokenHash: hashedToken } });
    }
    res.cookie(this.sessionCookieName, '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
      path: '/',
    });
    return { success: true };
  }

  async validateSession(token: string): Promise<{ user: SessionUser; sessionId: string }> {
    const hashedToken = this.hashToken(token);
    const session = await this.prisma.session.findFirst({
      where: { tokenHash: hashedToken, expiresAt: { gt: new Date() } },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException('Session expired');
    }

    if (!session.user.emailVerifiedAt) {
      throw new UnauthorizedException('Email not verified');
    }

    const consentCount = await this.prisma.consentRecord.count({
      where: { actorUserId: session.userId, revokedAt: null },
    });

    return {
      user: this.toSessionUser(session.user, consentCount),
      sessionId: session.id,
    };
  }

  readSessionCookie(req: RequestLike): string | undefined {
    const cookieHeader = req.headers?.cookie;
    if (!cookieHeader) return undefined;
    const headerValue = Array.isArray(cookieHeader) ? cookieHeader.join(';') : cookieHeader;
    const cookies = headerValue.split(';').reduce<Record<string, string>>((acc: Record<string, string>, part: string) => {
      const [key, ...value] = part.trim().split('=');
      if (key) {
        acc[key] = decodeURIComponent(value.join('='));
      }
      return acc;
    }, {});
    const token = cookies[this.sessionCookieName];
    return token || undefined;
  }

  async getSessionUser(userId: string): Promise<SessionUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const consentCount = await this.prisma.consentRecord.count({
      where: { actorUserId: user.id, revokedAt: null },
    });
    return this.toSessionUser(user, consentCount);
  }

  private passwordIssues(password: string): string[] {
    const issues: string[] = [];
    if (password.length < 12) issues.push('Use at least 12 characters.');
    if (!/[A-Z]/.test(password)) issues.push('Include at least one uppercase letter.');
    if (!/[a-z]/.test(password)) issues.push('Include at least one lowercase letter.');
    if (!/[0-9]/.test(password)) issues.push('Include at least one digit.');
    if (!/[^A-Za-z0-9]/.test(password)) issues.push('Include at least one special character.');
    return issues;
  }

  private attachSessionCookie(res: ResponseLike, token: string, expiresAt: Date) {
    res.cookie(this.sessionCookieName, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      expires: expiresAt,
      path: '/',
    });
  }

  private toSessionUser(user: User, consentCount: number): SessionUser {
    const needsConsent = (user.role === Role.parent || user.role === Role.patient) && consentCount === 0;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: Boolean(user.emailVerifiedAt),
      needsConsent,
    };
  }

  private generateToken() {
    return randomBytes(32).toString('hex');
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${salt}:${derivedKey.toString('hex')}`;
  }

  private async verifyPassword(password: string, hashed: string): Promise<boolean> {
    const [salt, key] = hashed.split(':');
    if (!salt || !key) return false;
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
    return timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
  }
}
