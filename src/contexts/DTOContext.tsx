'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiService } from '@/lib/api';
import { DTO } from '@/types/dto';
import { usePermissions } from './PermissionContext';

interface DTOContextType {
  dtos: DTO[];
  isLoading: boolean;
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  } | null;
  currentPage: number;
  createDTO: (dtoData: Omit<DTO, 'dto_id' | 'created_at' | 'updated_at'> & { receipt?: File | null }) => Promise<void>;
  updateDTO: (id: number, dtoData: Omit<DTO, 'dto_id' | 'created_at' | 'updated_at'> & { receipt?: File | null }) => Promise<void>;
  deleteDTO: (id: number) => Promise<void>;
  refreshDTOs: (page?: number) => Promise<void>;
  setPage: (page: number) => void;
}

const DTOContext = createContext<DTOContextType | undefined>(undefined);

interface DTOProviderProps {
  children: ReactNode;
}

export function DTOProvider({ children }: DTOProviderProps) {
  const [dtos, setDtos] = useState<DTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<{
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { hasPermission } = usePermissions();

  const refreshDTOs = async (page: number = currentPage) => {
    try {
      console.log('📋 Required permission for getDTOs: dtos:read');
      const response = await apiService.getDTOs(page, 100);
      setDtos(response.dtos);
      setPagination(response.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch DTOs:', error);
    }
  };

  const setPage = (page: number) => {
    setCurrentPage(page);
    refreshDTOs(page);
  };

  useEffect(() => {
    const loadDTOs = async () => {
      setIsLoading(true);
      // For now, load DTOs regardless of permission for testing
      // TODO: Add proper permission checking
      await refreshDTOs();
      setIsLoading(false);
    };

    loadDTOs();
  }, []);

  const createDTO = async (dtoData: Omit<DTO, 'dto_id' | 'created_at' | 'updated_at'> & { receipt?: File | null }) => {
    try {
      const newDTO = await apiService.createDTO(dtoData);
      setDtos(prev => [...prev, newDTO]);
      refreshDTOs(); // Refresh to include new DTO and update pagination
    } catch (error) {
      throw error;
    }
  };

  const updateDTO = async (id: number, dtoData: Omit<DTO, 'dto_id' | 'created_at' | 'updated_at'> & { receipt?: File | null }) => {
    try {
      const updatedDTO = await apiService.updateDTO(id, dtoData);
      setDtos(prev => prev.map(dto => dto.dto_id === id ? updatedDTO : dto));
      refreshDTOs(); // Refresh to update DTO and pagination
    } catch (error) {
      throw error;
    }
  };

  const deleteDTO = async (id: number) => {
    try {
      await apiService.deleteDTO(id);
      setDtos(prev => prev.filter(dto => dto.dto_id !== id));
      refreshDTOs(); // Refresh to update pagination
    } catch (error) {
      throw error;
    }
  };

  const value: DTOContextType = {
    dtos,
    isLoading,
    pagination,
    currentPage,
    createDTO,
    updateDTO,
    deleteDTO,
    refreshDTOs,
    setPage,
  };

  return <DTOContext.Provider value={value}>{children}</DTOContext.Provider>;
}

export function useDTOs() {
  const context = useContext(DTOContext);
  if (context === undefined) {
    throw new Error('useDTOs must be used within a DTOProvider');
  }
  return context;
}
