import { Role } from '@prisma/client';

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  emailVerified: boolean;
  needsConsent: boolean;
};
