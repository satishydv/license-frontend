"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download, Eye, FileImage, FileText } from 'lucide-react'

type Application = {
  id: number
  name: string
  father_name: string
  contact_no: string
  dob: string
  blood_group: string
  state: string
  city: string
  license_type: string
  application_no: string
  license_no: string
  issue_date: string
  expiry_date: string
  cover_class: string
  amount: string
  pay_amount: string | null
  mode_of_payment: string
  license_attachment_path: string | null
  payment_receipt_path: string | null
  created_at: string
  updated_at: string
}

interface ViewApplicationDialogProps {
  isOpen: boolean
  onClose: () => void
  application: Application | null
}

export default function ViewApplicationDialog({ isOpen, onClose, application }: ViewApplicationDialogProps) {
  const [completeApplication, setCompleteApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (application && isOpen) {
      fetchCompleteApplication(application.id)
    }
  }, [application, isOpen])

  const fetchCompleteApplication = async (id: number) => {
    setLoading(true)
    try {
      const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '')
      const response = await fetch(`${apiBase}/applications/${id}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setCompleteApplication(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching complete application data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatLicenseType = (type: string) => {
    const typeMap: Record<string, string> = {
      'light-to-heavy': 'Light to Heavy',
      'direct-heavy': 'Direct Heavy',
      'light-license-renewal': 'Light License / Renewal',
      'correction': 'Correction'
    }
    return typeMap[type] || type
  }

  const formatPaymentMode = (mode: string) => {
    const modeMap: Record<string, string> = {
      'cash': 'Cash',
      'upi': 'UPI',
      'bank-transfer': 'Bank Transfer'
    }
    return modeMap[mode] || mode
  }

  const getImageUrl = (path: string | null) => {
    if (!path) return null
    // For static files, we need to access them directly from the root, not through the API
    const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost/driving-license/index.php/api')
    // Extract the base URL without the API path
    const baseUrl = apiBase.replace('/index.php/api', '')
    return `${baseUrl}/${path}`
  }

  const handleDownload = (path: string | null, filename: string) => {
    if (!path) return
    const url = getImageUrl(path)
    if (url) {
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleClose = () => {
    setCompleteApplication(null)
    onClose()
  }

  if (!isOpen) return null

  const app = completeApplication || application
  if (!app) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Application Details</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading application details...</div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Personal Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</label>
                    <p className="text-gray-900 dark:text-white">{app.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Father&apos;s Name</label>
                    <p className="text-gray-900 dark:text-white">{app.father_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Contact Number</label>
                    <p className="text-gray-900 dark:text-white">{app.contact_no}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Date of Birth</label>
                    <p className="text-gray-900 dark:text-white">{formatDate(app.dob)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Blood Group</label>
                    <p className="text-gray-900 dark:text-white">{app.blood_group}</p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Address Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">State</label>
                    <p className="text-gray-900 dark:text-white">{app.state}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">City</label>
                    <p className="text-gray-900 dark:text-white">{app.city}</p>
                  </div>
                </div>
              </div>

              {/* License Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                  License Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">License Type</label>
                    <p className="text-gray-900 dark:text-white">{formatLicenseType(app.license_type)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Application Number</label>
                    <p className="text-gray-900 dark:text-white">{app.application_no}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">License Number</label>
                    <p className="text-gray-900 dark:text-white">{app.license_no}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Issue Date</label>
                    <p className="text-gray-900 dark:text-white">{formatDate(app.issue_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Expiry Date</label>
                    <p className="text-gray-900 dark:text-white">{formatDate(app.expiry_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Cover/Class</label>
                    <p className="text-gray-900 dark:text-white">{app.cover_class}</p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Payment Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Amount</label>
                    <p className="text-gray-900 dark:text-white">₹{app.amount}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Pay Amount</label>
                    <p className="text-gray-900 dark:text-white">{app.pay_amount ? `₹${app.pay_amount}` : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Mode of Payment</label>
                    <p className="text-gray-900 dark:text-white">{formatPaymentMode(app.mode_of_payment)}</p>
                  </div>
                </div>
              </div>

              {/* Attachments */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Attachments
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* License Attachment */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300">License Attachment</h4>
                    {app.license_attachment_path ? (
                      <div className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center space-x-3 mb-3">
                          <FileImage className="w-8 h-8 text-blue-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {app.license_attachment_path.split('/').pop()}
                            </p>
                            <p className="text-xs text-gray-500">License Document</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const url = getImageUrl(app.license_attachment_path);
                              if (url) window.open(url, '_blank');
                            }}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(app.license_attachment_path, 'license-attachment')}
                            className="flex items-center space-x-1"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border rounded-lg p-4 bg-white text-center text-gray-500">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">No license attachment uploaded</p>
                      </div>
                    )}
                  </div>

                  {/* Payment Receipt */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300">Payment Receipt</h4>
                    {app.payment_receipt_path ? (
                      <div className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center space-x-3 mb-3">
                          <FileImage className="w-8 h-8 text-green-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {app.payment_receipt_path.split('/').pop()}
                            </p>
                            <p className="text-xs text-gray-500">Payment Receipt</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const url = getImageUrl(app.payment_receipt_path);
                              if (url) window.open(url, '_blank');
                            }}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(app.payment_receipt_path, 'payment-receipt')}
                            className="flex items-center space-x-1"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border rounded-lg p-4 bg-white text-center text-gray-500">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">No payment receipt uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Application Timeline */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Application Timeline
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Created At</label>
                    <p className="text-gray-900 dark:text-white">{formatDate(app.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</label>
                    <p className="text-gray-900 dark:text-white">{formatDate(app.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-6 mt-6 border-t">
            <Button
              onClick={handleClose}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
