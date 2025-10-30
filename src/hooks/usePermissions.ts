'use client';

import { useSession } from 'next-auth/react';
import { UserRole, hasPermission, hasAnyRole, canAccessRoute } from '@/lib/permissions';

export function usePermissions() {
  const { data: session } = useSession();
  const userRole = session?.user?.role as UserRole || 'USER';

  const checkPermission = (resource: string, action: string): boolean => {
    return hasPermission(userRole, resource, action);
  };

  const checkRole = (allowedRoles: UserRole[]): boolean => {
    return hasAnyRole(userRole, allowedRoles);
  };

  const canAccess = (route: string): boolean => {
    return canAccessRoute(userRole, route);
  };

  const isAdmin = (): boolean => {
    return userRole === 'ADMIN';
  };

  const isConcierge = (): boolean => {
    return userRole === 'CONCIERGE';
  };

  const isUser = (): boolean => {
    return userRole === 'USER';
  };

  const isAtLeastConcierge = (): boolean => {
    return ['CONCIERGE', 'ADMIN'].includes(userRole);
  };

  return {
    userRole,
    checkPermission,
    checkRole,
    canAccess,
    isAdmin,
    isConcierge,
    isUser,
    isAtLeastConcierge,
  };
}