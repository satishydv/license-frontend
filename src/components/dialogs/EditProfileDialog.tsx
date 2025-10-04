"use client"

import React, { useState, useEffect } from 'react'
import { apiService } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface User {
  id: number
  name: string
  email: string
  phone_no?: string
  role: string
  status: string
  created_at: string
  last_login?: string
}

interface EditProfileDialogProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onUpdate: () => void
}

export default function EditProfileDialog({ isOpen, onClose, user, onUpdate }: EditProfileDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_no: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone_no: user.phone_no || ''
      })
      setErrors({})
    }
  }, [user, isOpen])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (formData.phone_no && formData.phone_no.length > 20) {
      newErrors.phone_no = 'Phone number must be 20 characters or less'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      await apiService.updateProfile(formData)
      onUpdate()
      onClose()
    } catch (error: unknown) {
      console.error('Failed to update profile:', error)
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to update profile' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: '',
        email: '',
        phone_no: ''
      })
      setErrors({})
      onClose()
    }
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Profile
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your full name"
              disabled={isLoading}
            />
            {errors.name && <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email address"
              disabled={isLoading}
            />
            {errors.email && <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone_no">Phone Number</Label>
            <Input
              id="phone_no"
              type="tel"
              value={formData.phone_no}
              onChange={(e) => handleInputChange('phone_no', e.target.value)}
              placeholder="Enter your phone number (optional)"
              disabled={isLoading}
            />
            {errors.phone_no && <p className="text-sm text-red-600 dark:text-red-400">{errors.phone_no}</p>}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
