'use client';

import { useState, useEffect } from 'react';
import { useVendors } from '@/contexts/VendorContext';
import { useVendorPermissions } from '@/contexts/PermissionContext';
import { VendorsDataTable } from '@/components/tables/vendors-data-table';
import { createVendorColumns } from '@/components/tables/vendor-columns';
import AddVendorDialog from '@/components/dialogs/AddVendorDialog';
import EditVendorDialog from '@/components/dialogs/EditVendorDialog';
import { Vendor } from '@/types/vendor';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

export default function VendorsPage() {
  const { vendors, isLoading, deleteVendor, pagination, currentPage, setPage } = useVendors();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  // Check permissions
  const { canCreateVendors, canReadVendors, canUpdateVendors, canDeleteVendors } = useVendorPermissions();

  // Check if user has permission to read vendors
  if (!canReadVendors) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-red-600 text-6xl mb-4">🚫</div>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
            <p className="text-red-600">
              You don&apos;t have permission to view vendors. Please contact your administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (vendor: Vendor) => {
    if (!confirm(`Are you sure you want to delete ${vendor.name}?`)) return;
    
    try {
      await deleteVendor(vendor.vendor_id);
    } catch (error) {
      console.error('Failed to delete vendor:', error);
      alert('Failed to delete vendor');
    }
  };

  const columns = createVendorColumns(
    canUpdateVendors ? handleEdit : undefined, 
    canDeleteVendors ? handleDelete : undefined
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Vendors</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage and view all vendors in the system.
          </p>
        </div>
        {canCreateVendors && (
          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-medium px-4 py-2 rounded-md transition-colors w-full sm:w-auto"
          >
            Add New Vendor
          </button>
        )}
      </div>

      <div className="w-full overflow-hidden">
        <VendorsDataTable 
          columns={columns} 
          data={vendors} 
          searchKey="name"
          searchPlaceholder="Filter vendors..."
        />
      </div>

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
            Showing {((currentPage - 1) * 100) + 1} to {Math.min(currentPage * 100, pagination.total)} of {pagination.total} vendors
          </div>
        </div>
      )}

      {canCreateVendors && (
        <AddVendorDialog 
          isOpen={isAddDialogOpen} 
          onClose={() => setIsAddDialogOpen(false)} 
        />
      )}

      {canUpdateVendors && (
        <EditVendorDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingVendor(null);
          }}
          vendor={editingVendor}
        />
      )}
    </div>
  );
}