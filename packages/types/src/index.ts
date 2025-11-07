export type Role = 'patient' | 'parent' | 'practitioner' | 'admin';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}
