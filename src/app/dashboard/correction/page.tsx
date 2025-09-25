"use client"
import React, { useEffect, useState } from 'react'
import { DataTable } from '@/components/tables/data-table'
import { createApplicationColumns } from '@/components/tables/application-columns'
import EditApplicationDialog from '@/components/dialogs/EditApplicationDialog'
import ViewApplicationDialog from '@/components/dialogs/ViewApplicationDialog'
import { apiService } from '@/lib/api'

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

const Page = () => {
  const [data, setData] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingApplication, setEditingApplication] = useState<Application | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewingApplication, setViewingApplication] = useState<Application | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const applications = await apiService.getApplications('correction')
      setData(applications as Application[])
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleEdit = (application: Application) => {
    setEditingApplication(application)
    setIsEditDialogOpen(true)
  }

  const handleView = (application: Application) => {
    setViewingApplication(application)
    setIsViewDialogOpen(true)
  }

  const handleDelete = async (application: Application) => {
    if (!confirm(`Are you sure you want to delete ${application.name}'s application?`)) return
    
    try {
      await apiService.deleteApplication(application.id)
      await fetchData() // Refresh the data
    } catch (error) {
      console.error('Failed to delete application:', error)
      alert('Failed to delete application')
    }
  }

  const columns = createApplicationColumns(handleEdit, handleDelete, handleView)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Correction Applications</h1>
      <DataTable columns={columns} data={data} searchKey="name" searchPlaceholder="Search by name..." />
      {loading && <p className="mt-2 text-sm text-gray-500">Loading...</p>}
      
      <EditApplicationDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false)
          setEditingApplication(null)
        }}
        application={editingApplication}
        onUpdate={fetchData}
      />

      <ViewApplicationDialog
        isOpen={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false)
          setViewingApplication(null)
        }}
        application={viewingApplication}
      />
    </div>
  )
}

export default Page