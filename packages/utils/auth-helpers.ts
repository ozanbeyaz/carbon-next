import { Session } from 'next-auth';
import { SessionUser } from '@repo/types/auth';
import { UserRole } from '@repo/db';

interface CheckAuthorizationParams {
  session: Session | null;
  allowedRoles: UserRole[];
  facilityId?: string; // Optional: for facility-specific checks
}

/**
 * Checks if the user is authorized based on their role and facility access.
 * @returns {boolean} True if authorized, false otherwise.
 */
export function checkAuthorization({
  session,
  allowedRoles,
  facilityId,
}: CheckAuthorizationParams): boolean {
  if (!session?.user) {
    return false;
  }

  const user = session.user as SessionUser;

  // 1. Check if the user's role is in the allowed list
  const hasRolePermission = allowedRoles.includes(user.role);
  if (!hasRolePermission) {
    return false;
  }

  // 2. If a facilityId is provided, check if the user has access to it
  if (facilityId) {
    // Admins and Company Admins have access to all facilities by default
    if (user.role === UserRole.ADMIN || user.role === UserRole.COMPANY_ADMIN) {
      return true;
    }
    const hasFacilityAccess = user.accessibleFacilityIds.includes(facilityId);
    if (!hasFacilityAccess) {
      return false;
    }
  }

  // If all checks pass, the user is authorized
  return true;
}
