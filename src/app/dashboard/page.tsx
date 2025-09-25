'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/contexts/UserContext';
import { useRoles } from '@/contexts/RoleContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const { users, isLoading: usersLoading } = useUsers();
  const { roles, isLoading: rolesLoading } = useRoles();

  const totalUsers = users.length;
  const totalRoles = roles.length;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome Back, {user?.name || 'User'}!
        </h1>
        <p className="text-gray-600">
          Here&apos;s what&apos;s happening with your system today
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Users Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Total Users
              </h3>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gray-800">
                  {usersLoading ? '...' : totalUsers}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  registered
                </span>
              </div>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Active
            </span>
          </div>
        </div>

        {/* Total Roles Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Total Roles
              </h3>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gray-800">
                  {rolesLoading ? '...' : totalRoles}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  configured
                </span>
              </div>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Permissions
            </span>
          </div>
        </div>

        {/* System Status Card */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                System Status
              </h3>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gray-800">
                  Online
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  & running
                </span>
              </div>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
              Healthy
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <h3 className="font-medium text-gray-800 mb-2">Manage Users</h3>
            <p className="text-sm text-gray-600 mb-3">Add, edit, or remove user accounts</p>
            <a 
              href="/dashboard/users" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Go to Users
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <h3 className="font-medium text-gray-800 mb-2">Manage Roles</h3>
            <p className="text-sm text-gray-600 mb-3">Configure roles and permissions</p>
            <a 
              href="/dashboard/roles" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Go to Roles
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}