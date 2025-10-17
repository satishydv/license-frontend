'use client';

import { useState } from 'react';
import { useRoles } from '@/contexts/RoleContext';

interface AddRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const TABLE_PERMISSIONS = [
  {
    table: 'Users',
    permissions: [
      { id: 'users:create', label: 'Create' },
      { id: 'users:read', label: 'Read' },
      { id: 'users:update', label: 'Update' },
      { id: 'users:delete', label: 'Delete' },
    ]
  },
  {
    table: 'Roles',
    permissions: [
      { id: 'roles:create', label: 'Create' },
      { id: 'roles:read', label: 'Read' },
      { id: 'roles:update', label: 'Update' },
      { id: 'roles:delete', label: 'Delete' },
    ]
  },
  {
    table: 'Applications',
    permissions: [
      { id: 'applications:create', label: 'Create' },
      { id: 'applications:read', label: 'Read' },
      { id: 'applications:update', label: 'Update' },
      { id: 'applications:delete', label: 'Delete' },
    ]
  },
  {
    table: 'Vendors',
    permissions: [
      { id: 'vendors:create', label: 'Create' },
      { id: 'vendors:read', label: 'Read' },
      { id: 'vendors:update', label: 'Update' },
      { id: 'vendors:delete', label: 'Delete' },
    ]
  },
  {
    table: 'DTO',
    permissions: [
      { id: 'dto:create', label: 'Create' },
      { id: 'dto:read', label: 'Read' },
      { id: 'dto:update', label: 'Update' },
      { id: 'dto:delete', label: 'Delete' },
    ]
  },
  {
    table: 'Cities',
    permissions: [
      { id: 'cities:create', label: 'Create' },
      { id: 'cities:read', label: 'Read' },
      { id: 'cities:update', label: 'Update' },
      { id: 'cities:delete', label: 'Delete' },
    ]
  },
  {
    table: 'Reports',
    permissions: [
      { id: 'reports:read', label: 'Read' },
    ]
  }
];

function AddRoleDialog({ isOpen, onClose }: AddRoleDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { createRole } = useRoles();

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setPermissions(prev => [...prev, permissionId]);
    } else {
      setPermissions(prev => prev.filter(p => p !== permissionId));
    }
  };

  const handleSelectAll = () => {
    const allPermissions = TABLE_PERMISSIONS.flatMap(tableGroup => 
      tableGroup.permissions.map(permission => permission.id)
    );
    
    const isAllSelected = allPermissions.every(permission => 
      permissions.includes(permission)
    );
    
    setPermissions(isAllSelected ? [] : allPermissions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await createRole(name, description, permissions);
      // Reset form
      setName('');
      setDescription('');
      setPermissions([]);
      onClose();
    } catch (err: unknown) {
      console.error('Role creation error:', err);
      console.log('Full error object:', err);
      let errorMessage = 'Failed to create role';
      
      if (err instanceof Error) {
        const message = err.message.toLowerCase();
        console.log('Error message:', err.message);
        
        // Check for specific error patterns - expanded list
        if (message.includes('duplicate') || 
            message.includes('already exists') || 
            message.includes('unique constraint') ||
            message.includes('name already taken') ||
            message.includes('role name exists') ||
            message.includes('conflict') ||
            message.includes('integrity constraint')) {
          errorMessage = 'A role with this name already exists. Please choose a different name.';
        } else if (message.includes('name') && message.includes('required')) {
          errorMessage = 'Role name is required.';
        } else if (message.includes('permissions') && message.includes('required')) {
          errorMessage = 'At least one permission is required.';
        } else if (message.includes('validation failed')) {
          // For validation failed, let's try to be more specific
          if (message.includes('name')) {
            errorMessage = 'Role name validation failed. Please check the name and try again.';
          } else if (message.includes('permission')) {
            errorMessage = 'Permission validation failed. Please select at least one permission.';
          } else {
            errorMessage = 'Please check all required fields and try again.';
          }
        } else if (message.includes('unauthorized') || message.includes('forbidden')) {
          errorMessage = 'You do not have permission to create roles.';
        } else if (message.includes('network') || message.includes('connection')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (message.includes('server error') || message.includes('internal error')) {
          errorMessage = 'Server error occurred. Please try again later.';
        } else if (err.message && err.message !== 'Request failed') {
          // Show the actual error message if it's not generic
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setPermissions([]);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-6xl max-h-[75vh] mx-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Add New Role</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Create a new role with specific permissions. Fill in the details below.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter role name"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter role description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Permissions
              </label>
              <input
                type="checkbox"
                checked={TABLE_PERMISSIONS.flatMap(tableGroup => 
                  tableGroup.permissions.map(permission => permission.id)
                ).every(permission => permissions.includes(permission))}
                onChange={handleSelectAll}
                className="h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-gray-300 dark:border-gray-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Select All</span>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-5 gap-4 p-3">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Permission</div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">Create</div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">Read</div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">Update</div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">Delete</div>
                </div>
              </div>
              
              {/* Table Body */}
              <div className="max-h-64 overflow-y-auto">
                {TABLE_PERMISSIONS.map((tableGroup) => (
                  <div key={tableGroup.table} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <div className="grid grid-cols-5 gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      {/* Table Name */}
                      <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                        {tableGroup.table}
                      </div>
                      
                      {/* Permission Checkboxes */}
                      {tableGroup.table === 'Reports' ? (
                        // Special handling for Reports - only show checkbox in Read column
                        <>
                          <div></div> {/* Create column - empty */}
                          <div className="flex justify-center"> {/* Read column - checkbox */}
                            <input
                              type="checkbox"
                              checked={permissions.includes('reports:read')}
                              onChange={(e) => handlePermissionChange('reports:read', e.target.checked)}
                              className="h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                            />
                          </div>
                          <div></div> {/* Update column - empty */}
                          <div></div> {/* Delete column - empty */}
                        </>
                      ) : (
                        // Normal handling for other tables
                        tableGroup.permissions.map((permission) => (
                          <div key={permission.id} className="flex justify-center">
                            <input
                              type="checkbox"
                              checked={permissions.includes(permission.id)}
                              onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                              className="h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-gray-800 dark:text-gray-900 font-medium rounded-md transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddRoleDialog;