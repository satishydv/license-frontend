'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiService } from '@/lib/api';
import { Vendor } from '@/types/vendor';
import { usePermissions } from './PermissionContext';

interface VendorContextType {
  vendors: Vendor[];
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
  createVendor: (vendorData: Omit<Vendor, 'vendor_id' | 'created_at' | 'updated_at'> & { receipt_image_path?: File | null }) => Promise<void>;
  updateVendor: (id: number, vendorData: Omit<Vendor, 'vendor_id' | 'created_at' | 'updated_at'> & { receipt_image_path?: File | null }) => Promise<void>;
  deleteVendor: (id: number) => Promise<void>;
  refreshVendors: (page?: number) => Promise<void>;
  setPage: (page: number) => void;
}

const VendorContext = createContext<VendorContextType | undefined>(undefined);

interface VendorProviderProps {
  children: ReactNode;
}

export function VendorProvider({ children }: VendorProviderProps) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
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

  const refreshVendors = async (page: number = currentPage) => {
    try {
      console.log('📋 Required permission for getVendors: vendors:read');
      const response = await apiService.getVendors(page, 100);
      setVendors(response.vendors);
      setPagination(response.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    }
  };

  const setPage = (page: number) => {
    setCurrentPage(page);
    refreshVendors(page);
  };

  useEffect(() => {
    const loadVendors = async () => {
      setIsLoading(true);
      // For now, load vendors regardless of permission for testing
      // TODO: Add proper permission checking
      await refreshVendors();
      setIsLoading(false);
    };

    loadVendors();
  }, []);

  const createVendor = async (vendorData: Omit<Vendor, 'vendor_id' | 'created_at' | 'updated_at'> & { receipt_image_path?: File | null }) => {
    try {
      const newVendor = await apiService.createVendor(vendorData);
      setVendors(prev => [...prev, newVendor]);
      refreshVendors(); // Refresh to include new vendor and update pagination
    } catch (error) {
      throw error;
    }
  };

  const updateVendor = async (id: number, vendorData: Omit<Vendor, 'vendor_id' | 'created_at' | 'updated_at'> & { receipt_image_path?: File | null }) => {
    try {
      const updatedVendor = await apiService.updateVendor(id, vendorData);
      setVendors(prev => prev.map(vendor => vendor.vendor_id === id ? updatedVendor : vendor));
      refreshVendors(); // Refresh to update vendor and pagination
    } catch (error) {
      throw error;
    }
  };

  const deleteVendor = async (id: number) => {
    try {
      await apiService.deleteVendor(id);
      setVendors(prev => prev.filter(vendor => vendor.vendor_id !== id));
      refreshVendors(); // Refresh to update pagination
    } catch (error) {
      throw error;
    }
  };

  const value: VendorContextType = {
    vendors,
    isLoading,
    pagination,
    currentPage,
    createVendor,
    updateVendor,
    deleteVendor,
    refreshVendors,
    setPage,
  };

  return <VendorContext.Provider value={value}>{children}</VendorContext.Provider>;
}

export function useVendors() {
  const context = useContext(VendorContext);
  if (context === undefined) {
    throw new Error('useVendors must be used within a VendorProvider');
  }
  return context;
}
