'use client';

import { useState, useEffect } from 'react';
import { useRoles } from '@/contexts/RoleContext';
import { Role } from '@/types/role';

interface EditRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
}

export default function EditRoleDialog({ isOpen, onClose, role }: EditRoleDialogProps) {
  const { updateRole } = useRoles();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    }
  ];

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions || []
      });
      setErrors({});
    }
  }, [role]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePermissionChange = (permission: string) => {
    setFormData(prev => {
      const newPermissions = prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission];
      return { ...prev, permissions: newPermissions };
    });
    // Clear error when user changes permissions
    if (errors.permissions) {
      setErrors(prev => ({
        ...prev,
        permissions: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Role name must be at least 2 characters';
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = 'At least one permission is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!role) return;

    setIsLoading(true);
    try {
      await updateRole(role.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        permissions: formData.permissions
      });
      
      // Reset form and close dialog
      setFormData({
        name: '',
        description: '',
        permissions: []
      });
      setErrors({});
      onClose();
    } catch (error: any) {
      console.error('Failed to update role:', error);
      setErrors({ submit: error.message || 'Failed to update role' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: '',
        description: '',
        permissions: []
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit Role</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {errors.submit}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Role Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter role name"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Enter role description"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Permissions *
            </label>
            <div className={`space-y-4 max-h-64 overflow-y-auto ${
              errors.permissions ? 'border-red-300' : 'border-gray-300'
            }`}>
              {TABLE_PERMISSIONS.map((tableGroup) => (
                <div key={tableGroup.table} className="border border-gray-200 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-800 mb-2">{tableGroup.table} Table</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {tableGroup.permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`permission-${permission.id}`}
                          checked={formData.permissions.includes(permission.id)}
                          onChange={() => handlePermissionChange(permission.id)}
                          className="mr-2 h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-gray-300 rounded"
                          disabled={isLoading}
                        />
                        <label 
                          htmlFor={`permission-${permission.id}`} 
                          className="text-sm text-gray-700 cursor-pointer"
                        >
                          {permission.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {errors.permissions && (
              <p className="mt-1 text-sm text-red-600">{errors.permissions}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-800 bg-yellow-400 hover:bg-yellow-500 rounded-md transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
