'use client';

import { useState } from 'react';
import { useRoles } from '@/contexts/RoleContext';
import AddRoleDialog from '@/components/dialogs/AddRoleDialog';

export default function RolesPage() {
  const { roles, isLoading, deleteRole } = useRoles();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    
    setDeleteLoading(id);
    try {
      await deleteRole(id);
    } catch (error) {
      console.error('Failed to delete role:', error);
      alert('Failed to delete role');
    } finally {
      setDeleteLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-800">Role Management</h1>
              <button
                onClick={() => setShowAddDialog(true)}
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-medium px-4 py-2 rounded-md transition-colors"
              >
                Add New Role
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No roles found. Create your first role!
                    </td>
                  </tr>
                ) : (
                  roles.map((role) => (
                    <tr key={role.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{role.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{role.description || 'No description'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.map((permission) => (
                            <span
                              key={permission}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                            >
                              {permission}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(role.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDelete(role.id)}
                          disabled={deleteLoading === role.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {deleteLoading === role.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddRoleDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
      />
    </div>
  );
}
