'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { apiService } from '@/lib/api';

interface PermissionContextType {
  permissions: string[];
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  const fetchPermissions = async () => {
    if (!isAuthenticated || !user) {
      setPermissions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // Get user's permissions from the API
      const userData = await apiService.getCurrentUser();
      if (userData && userData.permissions) {
        console.log('🔐 Current user permissions:', userData.permissions);
        setPermissions(userData.permissions);
      } else {
        console.log('🔐 No permissions found for user');
        setPermissions([]);
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [isAuthenticated, user]);

  const hasPermission = (permission: string): boolean => {
    const hasIt = permissions.includes(permission);
    console.log(`🔍 Permission check: ${permission} - ${hasIt ? '✅ GRANTED' : '❌ DENIED'}`);
    console.log('🔐 Current permissions:', permissions);
    return hasIt;
  };

  const hasAnyPermission = (permissionsToCheck: string[]): boolean => {
    return permissionsToCheck.some(permission => permissions.includes(permission));
  };

  const hasAllPermissions = (permissionsToCheck: string[]): boolean => {
    return permissionsToCheck.every(permission => permissions.includes(permission));
  };

  const refreshPermissions = async (): Promise<void> => {
    await fetchPermissions();
  };

  const value: PermissionContextType = {
    permissions,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refreshPermissions,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions(): PermissionContextType {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
}

// Convenience hooks for specific permissions
export function useUserPermissions() {
  const { hasPermission } = usePermissions();
  
  return {
    canCreateUsers: hasPermission('users:create'),
    canReadUsers: hasPermission('users:read'),
    canUpdateUsers: hasPermission('users:update'),
    canDeleteUsers: hasPermission('users:delete'),
  };
}

export function useRolePermissions() {
  const { hasPermission } = usePermissions();
  
  return {
    canCreateRoles: hasPermission('roles:create'),
    canReadRoles: hasPermission('roles:read'),
    canUpdateRoles: hasPermission('roles:update'),
    canDeleteRoles: hasPermission('roles:delete'),
  };
}

export function useVendorPermissions() {
  const { hasPermission } = usePermissions();
  
  return {
    canCreateVendors: hasPermission('vendors:create'),
    canReadVendors: hasPermission('vendors:read'),
    canUpdateVendors: hasPermission('vendors:update'),
    canDeleteVendors: hasPermission('vendors:delete'),
  };
}

export function useDTOPermissions() {
  const { hasPermission } = usePermissions();
  
  return {
    canCreateDTO: hasPermission('dto:create'),
    canReadDTO: hasPermission('dto:read'),
    canUpdateDTO: hasPermission('dto:update'),
    canDeleteDTO: hasPermission('dto:delete'),
  };
}

export function useCityPermissions() {
  const { hasPermission } = usePermissions();
  
  return {
    canCreateCities: hasPermission('cities:create'),
    canReadCities: hasPermission('cities:read'),
    canUpdateCities: hasPermission('cities:update'),
    canDeleteCities: hasPermission('cities:delete'),
  };
}