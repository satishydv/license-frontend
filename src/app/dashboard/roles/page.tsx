'use client';

import { useState } from 'react';
import { useRoles } from '@/contexts/RoleContext';
import { useRolePermissions } from '@/contexts/PermissionContext';
import { DataTable } from '@/components/tables/data-table';
import { createRoleColumns } from '@/components/tables/role-columns';
import AddRoleDialog from '@/components/dialogs/AddRoleDialog';
import EditRoleDialog from '@/components/dialogs/EditRoleDialog';
import { Role } from '@/types/role';

export default function RolesPage() {
  const { roles, isLoading, deleteRole } = useRoles();
  const { canCreateRoles, canReadRoles, canUpdateRoles, canDeleteRoles } = useRolePermissions();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Check if user has permission to read roles
  if (!canReadRoles) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-red-600 text-6xl mb-4">🚫</div>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
            <p className="text-red-600">
              You don&apos;t have permission to view roles. Please contact your administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setShowEditDialog(true);
  };

  const handleDelete = async (role: Role) => {
    if (!confirm(`Are you sure you want to delete the role "${role.name}"?`)) return;
    
    try {
      await deleteRole(role.id);
    } catch (error) {
      console.error('Failed to delete role:', error);
      alert('Failed to delete role');
    }
  };

  const columns = createRoleColumns(
    canUpdateRoles ? handleEdit : undefined, 
    canDeleteRoles ? handleDelete : undefined
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-orange-500">Roles</h1>
          <p className="text-muted-foreground">
            Manage user roles and permissions.
          </p>
        </div>
        {canCreateRoles && (
          <button
            onClick={() => setShowAddDialog(true)}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-medium px-4 py-2 rounded-md transition-colors"
          >
            Add New Role
          </button>
        )}
      </div>

      <DataTable 
        columns={columns} 
        data={roles} 
        searchKey="name"
        searchPlaceholder="Filter roles..."
      />

      {canCreateRoles && (
        <AddRoleDialog
          isOpen={showAddDialog}
          onClose={() => setShowAddDialog(false)}
        />
      )}

      {canUpdateRoles && (
        <EditRoleDialog
          isOpen={showEditDialog}
          onClose={() => {
            setShowEditDialog(false);
            setEditingRole(null);
          }}
          role={editingRole}
        />
      )}
    </div>
  );
}
