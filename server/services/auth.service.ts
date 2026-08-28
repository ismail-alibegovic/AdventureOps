import { getDatabase } from '../db/database';
import { UserAccount, UserRole } from '../../src/types';

export class AuthService {
  /**
   * Get all active staff accounts for login switcher / authentication
   */
  static listUsers(orgId: string): UserAccount[] {
    const db = getDatabase();
    return db.user_accounts.filter((u) => u.organization_id === orgId);
  }

  /**
   * Get user by ID
   */
  static getUserById(orgId: string, userId: string): UserAccount | null {
    const db = getDatabase();
    return db.user_accounts.find((u) => u.id === userId && u.organization_id === orgId) || null;
  }

  /**
   * Server-side role permission validator
   */
  static checkPermission(role: UserRole, requiredRoles: UserRole[]): boolean {
    if (role === UserRole.OWNER) return true; // Owner can do all
    return requiredRoles.includes(role);
  }
}
