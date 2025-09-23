'use client';

import { useState } from 'react';
import { useUsers } from '@/contexts/UserContext';
import { useUserPermissions } from '@/contexts/PermissionContext';
import { DataTable } from '@/components/tables/data-table';
import { createUserColumns } from '@/components/tables/user-columns';
import AddUserDialog from '@/components/dialogs/AddUserDialog';
import EditUserDialog from '@/components/dialogs/EditUserDialog';
import { User } from '@/types/user';

export default function UsersPage() {
  const { users, isLoading, deleteUser } = useUsers();
  const { canCreateUsers, canReadUsers, canUpdateUsers, canDeleteUsers } = useUserPermissions();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Check if user has permission to read users
  if (!canReadUsers) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-red-600 text-6xl mb-4">🚫</div>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
            <p className="text-red-600">
              You don't have permission to view users. Please contact your administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.name}?`)) return;
    
    try {
      await deleteUser(user.id);
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const columns = createUserColumns(
    canUpdateUsers ? handleEdit : undefined, 
    canDeleteUsers ? handleDelete : undefined
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">
            Manage and view all users in the system.
          </p>
        </div>
        {canCreateUsers && (
          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-medium px-4 py-2 rounded-md transition-colors"
          >
            Add New User
          </button>
        )}
      </div>

      <DataTable 
        columns={columns} 
        data={users} 
        searchKey="email"
        searchPlaceholder="Filter emails..."
      />

      {canCreateUsers && (
        <AddUserDialog 
          isOpen={isAddDialogOpen} 
          onClose={() => setIsAddDialogOpen(false)} 
        />
      )}

      {canUpdateUsers && (
        <EditUserDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingUser(null);
          }}
          user={editingUser}
        />
      )}
    </div>
  );
}