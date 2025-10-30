export type UserRole = 'USER' | 'ADMIN' | 'CONCIERGE';

export interface Permission {
  resource: string;
  action: string;
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  USER: [
    { resource: 'dashboard', action: 'read' },
    { resource: 'profile', action: 'read' },
    { resource: 'profile', action: 'update' },
    { resource: 'payouts', action: 'read' },
    { resource: 'payouts', action: 'create' },
    { resource: 'referrals', action: 'read' },
    { resource: 'referrals', action: 'create' },
    { resource: 'calculator', action: 'read' },
    { resource: 'wall-of-fame', action: 'read' },
    { resource: 'apex-pro', action: 'read' },
    { resource: 'hang-soi', action: 'request' },
    { resource: 'notifications', action: 'read' },
    { resource: 'notifications', action: 'update' },
  ],
  CONCIERGE: [
    // Inherits all USER permissions
    ...[
      { resource: 'dashboard', action: 'read' },
      { resource: 'profile', action: 'read' },
      { resource: 'profile', action: 'update' },
      { resource: 'payouts', action: 'read' },
      { resource: 'payouts', action: 'create' },
      { resource: 'referrals', action: 'read' },
      { resource: 'referrals', action: 'create' },
      { resource: 'calculator', action: 'read' },
      { resource: 'wall-of-fame', action: 'read' },
      { resource: 'apex-pro', action: 'read' },
      { resource: 'hang-soi', action: 'request' },
      { resource: 'notifications', action: 'read' },
      { resource: 'notifications', action: 'update' },
    ],
    // Additional CONCIERGE permissions
    { resource: 'hang-soi', action: 'manage' },
    { resource: 'users', action: 'read' },
    { resource: 'analytics', action: 'read' },
    { resource: 'payouts', action: 'process' },
    { resource: 'support', action: 'manage' },
  ],
  ADMIN: [
    // Inherits all CONCIERGE permissions
    ...[
      { resource: 'dashboard', action: 'read' },
      { resource: 'profile', action: 'read' },
      { resource: 'profile', action: 'update' },
      { resource: 'payouts', action: 'read' },
      { resource: 'payouts', action: 'create' },
      { resource: 'referrals', action: 'read' },
      { resource: 'referrals', action: 'create' },
      { resource: 'calculator', action: 'read' },
      { resource: 'wall-of-fame', action: 'read' },
      { resource: 'apex-pro', action: 'read' },
      { resource: 'hang-soi', action: 'request' },
      { resource: 'notifications', action: 'read' },
      { resource: 'notifications', action: 'update' },
      { resource: 'hang-soi', action: 'manage' },
      { resource: 'users', action: 'read' },
      { resource: 'analytics', action: 'read' },
      { resource: 'payouts', action: 'process' },
      { resource: 'support', action: 'manage' },
    ],
    // Additional ADMIN permissions
    { resource: 'users', action: 'create' },
    { resource: 'users', action: 'update' },
    { resource: 'users', action: 'delete' },
    { resource: 'analytics', action: 'export' },
    { resource: 'system', action: 'manage' },
    { resource: 'settings', action: 'read' },
    { resource: 'settings', action: 'update' },
    { resource: 'gamification', action: 'manage' },
    { resource: 'achievements', action: 'create' },
    { resource: 'achievements', action: 'update' },
    { resource: 'achievements', action: 'delete' },
  ],
};

export function hasPermission(userRole: UserRole, resource: string, action: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.some(
    permission => permission.resource === resource && permission.action === action
  );
}

export function hasAnyRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

export function canAccessRoute(userRole: UserRole, route: string): boolean {
  const routePermissions: Record<string, { resource: string; action: string }> = {
    '/dashboard': { resource: 'dashboard', action: 'read' },
    '/profile': { resource: 'profile', action: 'read' },
    '/payouts': { resource: 'payouts', action: 'read' },
    '/referrals': { resource: 'referrals', action: 'read' },
    '/calculator': { resource: 'calculator', action: 'read' },
    '/wall-of-fame': { resource: 'wall-of-fame', action: 'read' },
    '/apex-pro': { resource: 'apex-pro', action: 'read' },
    '/hang-soi': { resource: 'hang-soi', action: 'request' },
    '/admin': { resource: 'users', action: 'read' },
    '/admin/users': { resource: 'users', action: 'read' },
    '/admin/payouts': { resource: 'payouts', action: 'process' },
    '/admin/analytics': { resource: 'analytics', action: 'read' },
    '/admin/settings': { resource: 'settings', action: 'read' },
  };

  const permission = routePermissions[route];
  if (!permission) return true; // Allow access to routes not explicitly defined

  return hasPermission(userRole, permission.resource, permission.action);
}

export function getRoleHierarchy(): Record<UserRole, number> {
  return {
    USER: 1,
    CONCIERGE: 2,
    ADMIN: 3,
  };
}

export function hasHigherRole(userRole: UserRole, targetRole: UserRole): boolean {
  const hierarchy = getRoleHierarchy();
  return hierarchy[userRole] > hierarchy[targetRole];
}