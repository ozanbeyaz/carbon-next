import { User as NextAuthUser } from 'next-auth';
import { UserRole } from '@repo/db'; // Assuming enums are exported from db package

// Extend the built-in NextAuth User type
export interface SessionUser extends NextAuthUser {
  id: string;
  role: UserRole;
  accessibleFacilityIds: string[];
}
