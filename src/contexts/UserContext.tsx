'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiService, User } from '@/lib/api';
import { usePermissions } from './PermissionContext';

interface UserContextType {
  users: User[];
  isLoading: boolean;
  createUser: (name: string, email: string, password: string, role: string, status?: string, phone_no?: string) => Promise<void>;
  updateUser: (id: number, name: string, email: string, role: string, status: string, password?: string, phone_no?: string) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission } = usePermissions();

  const refreshUsers = async () => {
    try {
      console.log('📋 Required permission for getUsers: users:read');
      const usersData = await apiService.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      // Only load users if user has permission
      if (hasPermission('users:read')) {
        await refreshUsers();
      }
      setIsLoading(false);
    };

    loadUsers();
  }, [hasPermission]);

  const createUser = async (name: string, email: string, password: string, role: string, status: string = 'active', phone_no?: string) => {
    try {
      const newUser = await apiService.createUser({ name, email, password, role, status, phone_no });
      setUsers(prev => [...prev, newUser]);
    } catch (error) {
      throw error;
    }
  };

  const updateUser = async (id: number, name: string, email: string, role: string, status: string, password?: string, phone_no?: string) => {
    try {
      const updatedUser = await apiService.updateUser(id, { name, email, role, status, password, phone_no });
      setUsers(prev => prev.map(user => user.id === id ? updatedUser : user));
    } catch (error) {
      throw error;
    }
  };

  const deleteUser = async (id: number) => {
    try {
      await apiService.deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (error) {
      throw error;
    }
  };

  const value: UserContextType = {
    users,
    isLoading,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUsers() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
}
