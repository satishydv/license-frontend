'use client';

import { useState } from 'react';
import { useCities } from '@/contexts/CityContext';
import { usePermissions } from '@/contexts/PermissionContext';
import { DataTable } from '@/components/tables/data-table';
import { createCityColumns } from '@/components/tables/city-columns';
import AddCityDialog from '@/components/dialogs/AddCityDialog';
import EditCityDialog from '@/components/dialogs/EditCityDialog';
import { City } from '@/types/city';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

export default function CityPage() {
  const { cities, isLoading, deleteCity, pagination, currentPage, setPage } = useCities();
  const { hasPermission } = usePermissions();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);

  // Check permissions - For now, allow all operations for testing
  // TODO: Add proper permission checking
  const canCreateCities = true; // hasPermission('cities:create');
  const canReadCities = true; // hasPermission('cities:read');
  const canUpdateCities = true; // hasPermission('cities:update');
  const canDeleteCities = true; // hasPermission('cities:delete');

  // For now, always allow access for testing
  // TODO: Add proper permission checking

  const handleEdit = (city: City) => {
    setEditingCity(city);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (city: City) => {
    if (!confirm(`Are you sure you want to delete ${city.city_name}, ${city.city_state}?`)) return;
    
    try {
      await deleteCity(city.city_id);
    } catch (error) {
      console.error('Failed to delete city:', error);
      alert('Failed to delete city');
    }
  };

  const columns = createCityColumns(
    canUpdateCities ? handleEdit : undefined, 
    canDeleteCities ? handleDelete : undefined
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cities</h1>
          <p className="text-muted-foreground">
            Manage and view all cities in the system.
          </p>
        </div>
        {canCreateCities && (
          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-medium px-4 py-2 rounded-md transition-colors"
          >
            Add New City
          </button>
        )}
      </div>

      <DataTable 
        columns={columns} 
        data={cities} 
        searchKey="city_name"
        searchPlaceholder="Filter cities..."
      />

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (pagination.has_prev) {
                      setPage(currentPage - 1);
                    }
                  }}
                  className={!pagination.has_prev ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                let pageNum;
                if (pagination.total_pages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.total_pages - 2) {
                  pageNum = pagination.total_pages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(pageNum);
                      }}
                      isActive={currentPage === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              {pagination.total_pages > 5 && currentPage < pagination.total_pages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (pagination.has_next) {
                      setPage(currentPage + 1);
                    }
                  }}
                  className={!pagination.has_next ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          
          {/* Pagination info */}
          <div className="mt-4 text-center text-sm text-gray-600">
            Showing {((currentPage - 1) * 100) + 1} to {Math.min(currentPage * 100, pagination.total)} of {pagination.total} cities
          </div>
        </div>
      )}

      {canCreateCities && (
        <AddCityDialog 
          isOpen={isAddDialogOpen} 
          onClose={() => setIsAddDialogOpen(false)} 
        />
      )}

      {canUpdateCities && (
        <EditCityDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingCity(null);
          }}
          city={editingCity}
        />
      )}
    </div>
  );
}