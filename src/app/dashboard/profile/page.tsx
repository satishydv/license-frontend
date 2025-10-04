'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, Calendar, Shield, Clock, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import EditProfileDialog from '@/components/dialogs/EditProfileDialog';

export default function ProfilePage() {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'user':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'moderator':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">Please log in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Sidebar - User Info */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardContent className="p-6">
              <div className="text-center">
                {/* User Avatar */}
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
                
                {/* User Name */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h2>
                
                {/* User Role */}
                <Badge className={`mb-4 ${getRoleBadgeColor(user.role)}`}>
                  <Shield className="w-3 h-3 mr-1" />
                  {user.role}
                </Badge>
                
                {/* Contact Info */}
                <div className="space-y-3 text-left">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  
                  {user.phone_no && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{user.phone_no}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Joined {format(new Date(user.created_at), 'MMM dd, yyyy')}</span>
                  </div>
                  
                  {user.last_login && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span>Last login {format(new Date(user.last_login), 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Profile Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">Profile Information</CardTitle>
                  <CardDescription>
                    View your account details and information
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setIsEditDialogOpen(true)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">

              {/* User ID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">User ID</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                    <span className="text-sm text-gray-900 font-mono">#{user.id}</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Account Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusBadgeColor(user.status)}>
                      {user.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* User Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Full Name
                  </Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                    <span className="text-sm text-gray-900">{user.name || 'Not provided'}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                    <span className="text-sm text-gray-900">{user.email}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Phone Number
                  </Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                    <span className="text-sm text-gray-900">{user.phone_no || 'Not provided'}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Role</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                    <Badge className={getRoleBadgeColor(user.role)}>
                      <Shield className="w-3 h-3 mr-1" />
                      {user.role}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Account Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Account Created</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                    <span className="text-sm text-gray-900">
                      {format(new Date(user.created_at), 'MMMM dd, yyyy \'at\' h:mm a')}
                    </span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Last Login</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                    <span className="text-sm text-gray-900">
                      {user.last_login 
                        ? format(new Date(user.last_login), 'MMMM dd, yyyy \'at\' h:mm a')
                        : 'Never'
                      }
                    </span>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        user={user}
        onUpdate={() => {
          // Refresh user data in context
          refreshUser();
        }}
      />
    </div>
  );
}
