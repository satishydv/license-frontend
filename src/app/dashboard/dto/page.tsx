'use client';

import { useState } from 'react';
import { useDTOs } from '@/contexts/DTOContext';
import { usePermissions } from '@/contexts/PermissionContext';
import { DataTable } from '@/components/tables/data-table';
import { createDTOColumns } from '@/components/tables/dto-columns';
import AddDTODialog from '@/components/dialogs/AddDTODialog';
import EditDTODialog from '@/components/dialogs/EditDTODialog';
import { DTO } from '@/types/dto';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

export default function DTOPage() {
  const { dtos, isLoading, deleteDTO, pagination, currentPage, setPage } = useDTOs();
  const { hasPermission } = usePermissions();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDTO, setEditingDTO] = useState<DTO | null>(null);

  // Check permissions - For now, allow all operations for testing
  // TODO: Add proper permission checking
  const canCreateDTOs = true; // hasPermission('dtos:create');
  const canReadDTOs = true; // hasPermission('dtos:read');
  const canUpdateDTOs = true; // hasPermission('dtos:update');
  const canDeleteDTOs = true; // hasPermission('dtos:delete');

  // For now, always allow access for testing
  // TODO: Add proper permission checking

  const handleEdit = (dto: DTO) => {
    setEditingDTO(dto);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (dto: DTO) => {
    if (!confirm(`Are you sure you want to delete DTO record for ${new Date(dto.date).toLocaleDateString()}?`)) return;
    
    try {
      await deleteDTO(dto.dto_id);
    } catch (error) {
      console.error('Failed to delete DTO:', error);
      alert('Failed to delete DTO');
    }
  };

  const columns = createDTOColumns(
    canUpdateDTOs ? handleEdit : undefined, 
    canDeleteDTOs ? handleDelete : undefined
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading DTOs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">DTO Management</h1>
          <p className="text-muted-foreground">
            Manage and view all DTO records in the system.
          </p>
        </div>
        {canCreateDTOs && (
          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-medium px-4 py-2 rounded-md transition-colors"
          >
            Add New DTO
          </button>
        )}
      </div>

      <DataTable 
        columns={columns} 
        data={dtos} 
        searchKey="date"
        searchPlaceholder="Filter by date..."
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
            Showing {((currentPage - 1) * 100) + 1} to {Math.min(currentPage * 100, pagination.total)} of {pagination.total} DTO records
          </div>
        </div>
      )}

      {canCreateDTOs && (
        <AddDTODialog 
          isOpen={isAddDialogOpen} 
          onClose={() => setIsAddDialogOpen(false)} 
        />
      )}

      {canUpdateDTOs && (
        <EditDTODialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingDTO(null);
          }}
          dto={editingDTO}
        />
      )}
    </div>
  );
}
