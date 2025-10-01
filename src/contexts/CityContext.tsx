'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiService } from '@/lib/api';
import { City } from '@/types/city';
import { usePermissions } from './PermissionContext';

interface CityContextType {
  cities: City[];
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
  searchTerm: string;
  createCity: (cityName: string, cityState: string) => Promise<void>;
  updateCity: (id: number, cityName: string, cityState: string) => Promise<void>;
  deleteCity: (id: number) => Promise<void>;
  refreshCities: (page?: number, search?: string) => Promise<void>;
  setPage: (page: number) => void;
  handleSearch: (search: string) => void;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

interface CityProviderProps {
  children: ReactNode;
}

export function CityProvider({ children }: CityProviderProps) {
  const [cities, setCities] = useState<City[]>([]);
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
  const [searchTerm, setSearchTerm] = useState('');
  const { hasPermission } = usePermissions();

  const refreshCities = async (page: number = currentPage, search: string = searchTerm) => {
    try {
      console.log('📋 Required permission for getCities: cities:read');
      const response = await apiService.getCities(page, 100, search);
      setCities(response.cities);
      setPagination(response.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch cities:', error);
    }
  };

  const setPage = (page: number) => {
    setCurrentPage(page);
    refreshCities(page, searchTerm);
  };

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    setCurrentPage(1); // Reset to first page when searching
    refreshCities(1, search);
  };

  useEffect(() => {
    const loadCities = async () => {
      setIsLoading(true);
      // Only load cities if user has permission
      if (hasPermission('cities:read')) {
        await refreshCities();
      }
      setIsLoading(false);
    };

    loadCities();
  }, [hasPermission]);

  const createCity = async (cityName: string, cityState: string) => {
    try {
      const newCity = await apiService.createCity({ city_name: cityName, city_state: cityState });
      setCities(prev => [...prev, newCity]);
    } catch (error) {
      throw error;
    }
  };

  const updateCity = async (id: number, cityName: string, cityState: string) => {
    try {
      const updatedCity = await apiService.updateCity(id, { city_name: cityName, city_state: cityState });
      setCities(prev => prev.map(city => city.city_id === id ? updatedCity : city));
    } catch (error) {
      throw error;
    }
  };

  const deleteCity = async (id: number) => {
    try {
      await apiService.deleteCity(id);
      setCities(prev => prev.filter(city => city.city_id !== id));
    } catch (error) {
      throw error;
    }
  };

  const value: CityContextType = {
    cities,
    isLoading,
    pagination,
    currentPage,
    searchTerm,
    createCity,
    updateCity,
    deleteCity,
    refreshCities,
    setPage,
    handleSearch,
  };

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}

export function useCities() {
  const context = useContext(CityContext);
  if (context === undefined) {
    throw new Error('useCities must be used within a CityProvider');
  }
  return context;
}
