import { SessionUser } from '../auth/auth.types';

export interface RequestLike {
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
  user?: SessionUser;
  sessionToken?: string;
  sessionId?: string;
}

export interface ResponseLike {
  cookie: (name: string, value: string, options?: Record<string, unknown>) => void;
}
