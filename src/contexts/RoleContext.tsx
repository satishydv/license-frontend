'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiService, Role } from '@/lib/api';
import { usePermissions } from './PermissionContext';

interface RoleContextType {
  roles: Role[];
  isLoading: boolean;
  createRole: (name: string, description: string, permissions: string[]) => Promise<void>;
  updateRole: (id: number, roleData: { name: string; description: string; permissions: string[] }) => Promise<void>;
  deleteRole: (id: number) => Promise<void>;
  refreshRoles: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

interface RoleProviderProps {
  children: ReactNode;
}

export function RoleProvider({ children }: RoleProviderProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission } = usePermissions();

  const refreshRoles = async () => {
    try {
      console.log('📋 Required permission for getRoles: roles:read');
      const rolesData = await apiService.getRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  useEffect(() => {
    const loadRoles = async () => {
      setIsLoading(true);
      // Only load roles if user has permission
      if (hasPermission('roles:read')) {
        await refreshRoles();
      }
      setIsLoading(false);
    };

    loadRoles();
  }, [hasPermission]);

  const createRole = async (name: string, description: string, permissions: string[]) => {
    try {
      const newRole = await apiService.createRole({ name, description, permissions });
      setRoles(prev => [...prev, newRole]);
    } catch (error) {
      throw error;
    }
  };

  const updateRole = async (id: number, roleData: { name: string; description: string; permissions: string[] }) => {
    try {
      const updatedRole = await apiService.updateRole(id, roleData);
      setRoles(prev => prev.map(role => role.id === id ? updatedRole : role));
    } catch (error) {
      throw error;
    }
  };

  const deleteRole = async (id: number) => {
    try {
      await apiService.deleteRole(id);
      setRoles(prev => prev.filter(role => role.id !== id));
    } catch (error) {
      throw error;
    }
  };

  const value: RoleContextType = {
    roles,
    isLoading,
    createRole,
    updateRole,
    deleteRole,
    refreshRoles,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRoles() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRoles must be used within a RoleProvider');
  }
  return context;
}
