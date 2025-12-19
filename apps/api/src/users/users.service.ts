import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthService } from '../auth/auth.service';
import { SessionUser } from '../auth/auth.types';
import { z } from 'zod';
import { Role } from '@prisma/client';

const consentSchema = z.object({
  childId: z.string().optional(),
  childName: z.string().min(2),
  preferredName: z.string().optional(),
  childDob: z
    .string()
    .optional()
    .transform((value) => (value ? new Date(value) : null))
    .refine((date) => !date || !isNaN(date.getTime()), 'Provide a valid date for the child.'),
  consentKind: z.string().default('guardian-consent'),
  method: z.string().min(2),
  details: z.string().optional(),
});

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService, private readonly authService: AuthService) {}

  async getProfile(userId: string) {
    return this.authService.getSessionUser(userId);
  }

  async listChildren(userId: string) {
    const children = await this.prisma.childProfile.findMany({
      where: { userId },
      include: { consents: { where: { revokedAt: null } } },
      orderBy: { createdAt: 'desc' },
    });

    return children.map((child) => ({
      id: child.id,
      name: child.name,
      preferredName: child.preferredName,
      dob: child.dob,
      consentStatus: child.consentStatus,
      consents: child.consents,
    }));
  }

  async listPractitionerPatients(userId: string) {
    const links = await this.prisma.patientLink.findMany({
      where: { practitioner: { userId } },
      include: {
        child: {
          select: { id: true, name: true, consentStatus: true, signals: true },
        },
      },
    });

    return links.map((link) => ({
      id: link.child.id,
      name: link.child.name,
      consentStatus: link.child.consentStatus,
      signals: link.child.signals,
    }));
  }

  async listUsersForAdmin() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, role: true, emailVerifiedAt: true, lastLoginAt: true },
    });
    return users.map((user) => ({
      ...user,
      emailVerified: Boolean(user.emailVerifiedAt),
    }));
  }

  async recordConsent(actor: SessionUser, payload: unknown) {
    if (actor.role !== Role.parent && actor.role !== Role.admin) {
      throw new ForbiddenException('Only parents or admins can record consent for children');
    }

    const data = consentSchema.parse(payload);
    if (!data.childId && !data.childDob) {
      throw new BadRequestException('A date of birth is required when creating a new child record');
    }
    let child = data.childId
      ? await this.prisma.childProfile.findUnique({ where: { id: data.childId } })
      : null;

    if (data.childId && !child) {
      throw new BadRequestException('Child not found');
    }

    if (child && actor.role === Role.parent && child.userId !== actor.id) {
      throw new ForbiddenException('You can only manage consent for your own children');
    }

    if (!child) {
      child = await this.prisma.childProfile.create({
        data: {
          userId: actor.id,
          name: data.childName,
          preferredName: data.preferredName,
          dob: data.childDob!,
          consentStatus: 'granted',
        },
      });
    }

    const consentRecord = await this.prisma.consentRecord.create({
      data: {
        childId: child.id,
        actorUserId: actor.id,
        kind: data.consentKind,
        method: data.method,
        details: data.details,
        grantedAt: new Date(),
        recordedBy: actor.role,
      },
    });

    const updatedChild = await this.prisma.childProfile.update({
      where: { id: child.id },
      data: { consentStatus: 'granted' },
      include: { consents: { where: { revokedAt: null } } },
    });

    return {
      child: updatedChild,
      consent: consentRecord,
    };
  }
}
