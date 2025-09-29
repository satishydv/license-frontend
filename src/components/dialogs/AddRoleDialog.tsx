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
      if (err instanceof Error && err.message && err.message.includes('Validation failed')) {
        setError('Validation failed. Please check your input and try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to create role');
      }
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Permissions
            </label>
            <div className="space-y-4">
              {TABLE_PERMISSIONS.map((tableGroup) => (
                <div key={tableGroup.table} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-2">{tableGroup.table} Table</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {tableGroup.permissions.map((permission) => (
                      <label key={permission.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={permissions.includes(permission.id)}
                          onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                          className="h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{permission.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
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