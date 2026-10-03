import { create } from 'zustand';
import { mockOrgs, mockUsers } from '../mocks/users';
import type { AdminUser, Organization } from '../types/admin';
import type { RoleName } from '../types/roles';

type AssignResult = { ok: true } | { ok: false; error: string };

/**
 * API swap later: users <- GET /api/admin/users, assignOrgAndRole -> POST /api/auth/assign
 * (the backend already forces org=NULL for admin and calls logoutAll on the target account).
 */
interface AdminState {
  users: AdminUser[];
  orgs: Organization[];
  assignOrgAndRole: (userId: number, role: RoleName, orgId: number | null) => AssignResult;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  users: mockUsers,
  orgs: mockOrgs,
  assignOrgAndRole: (userId, role, orgId) => {
    // Mirror backend rule: admin is never org-scoped; others require a valid org.
    let finalOrg: number | null = null;
    if (role !== 'admin') {
      if (orgId == null) return { ok: false, error: 'Choose an organization.' };
      if (!get().orgs.some((o) => o.id === orgId)) return { ok: false, error: 'Organization not found.' };
      finalOrg = orgId;
    }
    set((state) => ({
      users: state.users.map((u) => (u.id === userId ? { ...u, role_name: role, org_id: finalOrg } : u)),
    }));
    return { ok: true };
  },
}));

export const isPendingUser = (u: AdminUser): boolean =>
  !u.role_name || (u.role_name !== 'admin' && u.org_id == null);
