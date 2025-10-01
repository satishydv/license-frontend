"use client"
import React, { useEffect, useState } from 'react'
import { LightHeavyDataTable } from '@/components/tables/light-heavy-data-table' // Custom table with print button
import { createApplicationColumns } from '@/components/tables/application-columns'
import EditApplicationDialog from '@/components/dialogs/EditApplicationDialog'
import ViewApplicationDialog from '@/components/dialogs/ViewApplicationDialog'
import { apiService } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

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
  const [selectedApplications, setSelectedApplications] = useState<Application[]>([])

  const fetchData = async () => {
    setLoading(true)
    try {
      const applications = await apiService.getApplications('light-license-renewal')
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

  const handlePrint = () => {
    if (selectedApplications.length === 0) {
      alert('Please select at least one application to print')
      return
    }

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    // Use the same image URL construction as ViewApplicationDialog
    const getImageUrl = (path: string | null) => {
      if (!path) return null
      // For static files, we need to access them directly from the root, not through the API
      const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost/driving-license/index.php/api')
      // Extract the base URL without the API path
      const baseUrl = apiBase.replace('/index.php/api', '')
      return `${baseUrl}/${path}`
    }
    
    let printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Light License / Renewal Applications</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .application { margin-bottom: 40px; page-break-after: always; }
          .application:last-child { page-break-after: avoid; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          .section h3 { background-color: #f0f0f0; padding: 10px; margin: 0 0 10px 0; }
          .field { margin-bottom: 8px; }
          .field strong { display: inline-block; width: 150px; }
          .two-column { display: flex; gap: 20px; margin-bottom: 20px; }
          .column { flex: 1; }
          .column h3 { background-color: #f0f0f0; padding: 10px; margin: 0 0 10px 0; }
          .image-container { margin: 10px 0; text-align: center; }
          .image-container img { max-width: 250px; max-height: 180px; border: 1px solid #ccc; margin: 5px; }
          .image-container img.error { border: 2px solid #ff0000; background-color: #ffe6e6; }
          .no-attachment { color: #666; font-style: italic; text-align: center; padding: 20px; }
          .separator { border-top: 2px solid #333; margin: 30px 0; }
          @media print { 
            .separator { page-break-before: always; }
            .two-column { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Light License / Renewal Applications</h1>
          <p>Print Date: ${new Date().toLocaleDateString()}</p>
        </div>
    `

    selectedApplications.forEach((app, index) => {
      if (index > 0) {
        printContent += '<div class="separator"></div>'
      }
      
      // Debug logging
      console.log('Printing application:', app.name)
      console.log('License attachment path:', app.license_attachment_path)
      console.log('License attachment URL:', getImageUrl(app.license_attachment_path))
      console.log('Payment receipt path:', app.payment_receipt_path)
      console.log('Payment receipt URL:', getImageUrl(app.payment_receipt_path))
      
      printContent += `
        <div class="application">
          <div class="section">
            <h3>Personal Information</h3>
            <div class="field"><strong>Name:</strong> ${app.name}</div>
            <div class="field"><strong>Father's Name:</strong> ${app.father_name}</div>
            <div class="field"><strong>Contact No:</strong> ${app.contact_no}</div>
            <div class="field"><strong>Date of Birth:</strong> ${app.dob}</div>
            <div class="field"><strong>Blood Group:</strong> ${app.blood_group}</div>
            <div class="field"><strong>State:</strong> ${app.state}</div>
            <div class="field"><strong>City:</strong> ${app.city}</div>
          </div>
          
          <div class="two-column">
            <div class="column">
              <h3>License Information</h3>
              <div class="field"><strong>License Type:</strong> ${app.license_type}</div>
              <div class="field"><strong>Application No:</strong> ${app.application_no}</div>
              <div class="field"><strong>License No:</strong> ${app.license_no}</div>
              <div class="field"><strong>Issue Date:</strong> ${app.issue_date}</div>
              <div class="field"><strong>Expiry Date:</strong> ${app.expiry_date}</div>
              <div class="field"><strong>Cover Class:</strong> ${app.cover_class}</div>
            </div>
            <div class="column">
              <h3>License Attachment</h3>
              ${app.license_attachment_path ? `
                <div class="image-container">
                  <img src="${getImageUrl(app.license_attachment_path)}" 
                       alt="License Attachment" 
                       style="max-width: 100%; height: auto; border: 1px solid #ddd;"
                       onload="console.log('License image loaded successfully')"
                       onerror="this.style.display='none'; this.nextElementSibling.style.display='block'; console.error('Failed to load license image:', '${getImageUrl(app.license_attachment_path)}');">
                  <div style="display: none; padding: 20px; border: 2px dashed #ccc; text-align: center; color: #666;">
                    <div style="font-size: 14px; margin-bottom: 5px;">⚠️ Image could not be loaded</div>
                    <div style="font-size: 12px;">File: ${app.license_attachment_path}</div>
                    <div style="font-size: 12px;">URL: ${getImageUrl(app.license_attachment_path)}</div>
                  </div>
                </div>
              ` : '<div class="no-attachment">No license attachment available</div>'}
            </div>
          </div>
          
          <div class="two-column">
            <div class="column">
              <h3>Payment Information</h3>
              <div class="field"><strong>Amount:</strong> ₹${app.amount}</div>
              <div class="field"><strong>Pay Amount:</strong> ₹${app.pay_amount || 'N/A'}</div>
              <div class="field"><strong>Payment Mode:</strong> ${app.mode_of_payment}</div>
            </div>
            <div class="column">
              <h3>Payment Receipt</h3>
              ${app.payment_receipt_path ? `
                <div class="image-container">
                  <img src="${getImageUrl(app.payment_receipt_path)}" 
                       alt="Payment Receipt" 
                       style="max-width: 100%; height: auto; border: 1px solid #ddd;"
                       onload="console.log('Payment image loaded successfully')"
                       onerror="this.style.display='none'; this.nextElementSibling.style.display='block'; console.error('Failed to load payment image:', '${getImageUrl(app.payment_receipt_path)}');">
                  <div style="display: none; padding: 20px; border: 2px dashed #ccc; text-align: center; color: #666;">
                    <div style="font-size: 14px; margin-bottom: 5px;">⚠️ Image could not be loaded</div>
                    <div style="font-size: 12px;">File: ${app.payment_receipt_path}</div>
                    <div style="font-size: 12px;">URL: ${getImageUrl(app.payment_receipt_path)}</div>
                  </div>
                </div>
              ` : '<div class="no-attachment">No payment receipt available</div>'}
            </div>
          </div>
        </div>
      `
    })

    printContent += `
      </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    
    // Wait for images to load before printing
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
      }, 1000) // Wait 1 second for images to load
    }
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">Light License / Renewal Applications</h1>
      
      <LightHeavyDataTable 
        columns={columns} 
        data={data} 
        searchKey="name" 
        searchPlaceholder="Search by name..."
        onRowSelectionChange={setSelectedApplications}
        printButton={
          <Button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-md"
            disabled={selectedApplications.length === 0}
          >
            <Printer className="h-4 w-4" />
            Print Label
          </Button>
        }
      />
      
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

