"use client"

import React, { useState, useEffect } from 'react'
import { apiService } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Eye, FileImage, FileText, Upload } from 'lucide-react'

const INDIAN_STATES = [
  "Andaman & Nicobar Islands",
  "Andhra Pradesh", 
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra & Nagar Haveli",
  "Daman & Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
]

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

interface EditApplicationDialogProps {
  isOpen: boolean
  onClose: () => void
  application: Application | null
  onUpdate: () => void
}

export default function EditApplicationDialog({ isOpen, onClose, application, onUpdate }: EditApplicationDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    contactNo: '',
    dob: '',
    bloodGroup: '',
    state: '',
    city: '',
    vendor: '',
    licenseType: '',
    applicationNo: '',
    licenseNo: '',
    issueDate: '',
    expiryDate: '',
    coverClass: '',
    amount: '',
    payAmount: '',
    modeOfPayment: ''
  })
  const [cities, setCities] = useState<string[]>([])
  const [loadingCities, setLoadingCities] = useState(false)
  const [vendors, setVendors] = useState<Array<{vendor_id: number, name: string}>>([])
  const [loadingVendors, setLoadingVendors] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // File upload states
  const [licenseFile, setLicenseFile] = useState<File | null>(null)
  const [paymentFile, setPaymentFile] = useState<File | null>(null)
  const [dragActiveLicense, setDragActiveLicense] = useState(false)
  const [dragActivePayment, setDragActivePayment] = useState(false)

  useEffect(() => {
    if (application) {
      console.log('EditApplicationDialog received application:', application)
      // Fetch complete application data from API
      fetchCompleteApplication(application.id)
    } else {
      // Reset form when no application
      setFormData({
        name: '',
        fatherName: '',
        contactNo: '',
        dob: '',
        bloodGroup: '',
        state: '',
        city: '',
        vendor: '',
        licenseType: '',
        applicationNo: '',
        licenseNo: '',
        issueDate: '',
        expiryDate: '',
        coverClass: '',
        amount: '',
        payAmount: '',
        modeOfPayment: ''
      })
      setCities([])
      setErrors({})
    }
  }, [application])

  // Fetch vendors on component mount
  useEffect(() => {
    fetchVendors()
  }, [])

  const fetchCompleteApplication = async (id: number) => {
    try {
      const appData = await apiService.getApplication(id) as Record<string, unknown>
      console.log('Complete application data fetched:', appData)
      const stateValue = (appData.state as string) || ''
      const cityValue = (appData.city as string) || '' // Ensure it's always a string
      
      console.log('Setting formData with cityValue:', cityValue, 'type:', typeof cityValue)
      
      // Set form data with the actual city value from the database
      setFormData({
        name: (appData.name as string) || '',
        fatherName: (appData.father_name as string) || '',
        contactNo: (appData.contact_no as string) || '',
        dob: (appData.dob as string) || '',
        bloodGroup: (appData.blood_group as string) || '',
        state: stateValue,
        city: cityValue, // Set the actual city value from database
        vendor: (appData.vendor as string) || '',
        licenseType: (appData.license_type as string) || '',
        applicationNo: (appData.application_no as string) || '',
        licenseNo: (appData.license_no as string) || '',
        issueDate: (appData.issue_date as string) || '',
        expiryDate: (appData.expiry_date as string) || '',
        coverClass: (appData.cover_class as string) || '',
        amount: (appData.amount as string) || '',
        payAmount: (appData.pay_amount as string) || '',
        modeOfPayment: (appData.mode_of_payment as string) || ''
      })
      
      // Fetch cities for the existing state (this will populate the dropdown options)
      if (stateValue) {
        console.log('Fetching cities for state:', stateValue)        
        await fetchCities(stateValue)
        console.log('Cities fetched for dropdown options')
      }
      setErrors({})
    } catch (error) {
      console.error('Error fetching complete application data:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    // Special handling for contact number to restrict to 10 digits
    if (field === 'contactNo') {
      // Remove any non-digit characters and limit to 10 digits
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10)
      setFormData(prev => ({
        ...prev,
        [field]: digitsOnly
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
    
    // Clear error when user starts typing/selecting
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  // File upload handlers
  const handleLicenseFileUpload = (file: File) => {
    setLicenseFile(file)
  }

  const handlePaymentFileUpload = (file: File) => {
    setPaymentFile(file)
  }

  const handleLicenseDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveLicense(true)
    } else if (e.type === "dragleave") {
      setDragActiveLicense(false)
    }
  }

  const handleLicenseDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActiveLicense(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLicenseFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleLicenseInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleLicenseFileUpload(e.target.files[0])
    }
  }

  const handlePaymentDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActivePayment(true)
    } else if (e.type === "dragleave") {
      setDragActivePayment(false)
    }
  }

  const handlePaymentDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActivePayment(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePaymentFileUpload(e.dataTransfer.files[0])
    }
  }

  const handlePaymentInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handlePaymentFileUpload(e.target.files[0])
    }
  }

  // Helper function to get image URL
  const getImageUrl = (path: string | null) => {
    if (!path) return null
    const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost/driving-license/index.php/api')
    const baseUrl = apiBase.replace('/index.php/api', '')
    return `${baseUrl}/${path}`
  }

  const fetchCities = async (state: string) => {
    if (!state) return
    console.log('fetchCities called with state:', state)
    setLoadingCities(true)
    try {
      const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost/driving-license/index.php/api').replace(/\/$/, '')
      const url = `${apiBase}/cities?state=${encodeURIComponent(state)}`
      console.log('Fetching cities from URL:', url)
      const response = await fetch(url)
      console.log('Cities API response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Cities API response data:', data)
        // Handle both array response (from old API) and object response (from new API)
        let citiesList: string[] = []
        if (Array.isArray(data)) {
          console.log('Setting cities as array:', data)
          citiesList = data
          setCities(data)
        } else if (data && Array.isArray(data.cities)) {
          const cityNames = data.cities.map((city: any) => city.city_name)
          console.log('Setting cities from object:', cityNames)
          citiesList = cityNames
          setCities(cityNames)
        } else {
          console.log('No cities found in response, setting empty array')
          citiesList = []
          setCities([])
        }
        return citiesList // Return the cities list for immediate use
      } else {
        console.error('Failed to fetch cities:', response.status, response.statusText)
        setCities([])
        return []
      }
    } catch (error) {
      console.error('Error fetching cities:', error)
      setCities([])
      return []
    } finally {
      setLoadingCities(false)
    }
  }

  const fetchVendors = async () => {
    setLoadingVendors(true)
    try {
      const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost/driving-license/index.php/api').replace(/\/$/, '')
      // Use the public endpoint that doesn't require authentication
      const response = await fetch(`${apiBase}/vendors/public`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data && Array.isArray(data.data.vendors)) {
          setVendors(data.data.vendors.map((vendor: any) => ({
            vendor_id: vendor.vendor_id,
            name: vendor.name
          })))
        } else {
          setVendors([])
        }
      } else {
        console.error('Failed to fetch vendors:', response.status, response.statusText)
        setVendors([])
      }
    } catch (error) {
      console.error('Error fetching vendors:', error)
      setVendors([])
    } finally {
      setLoadingVendors(false)
    }
  }

  const handleStateChange = (state: string) => {
    handleInputChange('state', state)
    handleInputChange('city', '') // Clear city when state changes
    setCities([]) // Clear cities list
    fetchCities(state)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!formData.fatherName.trim()) {
      newErrors.fatherName = 'Father Name is required'
    }
    if (!formData.contactNo.trim()) {
      newErrors.contactNo = 'Contact number is required'
    } else if (formData.contactNo.length < 10) {
      newErrors.contactNo = 'Contact number must be 10 digits'
    }
    if (!formData.dob) {
      newErrors.dob = 'Date of Birth is required'
    }
    if (!formData.bloodGroup) {
      newErrors.bloodGroup = 'Blood Group is required'
    }
    if (!formData.state) {
      newErrors.state = 'State is required'
    }
    if (!formData.city) {
      newErrors.city = 'City is required'
    }
    if (!formData.licenseType) {
      newErrors.licenseType = 'License Type is required'
    }
    // Application Number is now optional
    if (!formData.licenseNo.trim()) {
      newErrors.licenseNo = 'License Number is required'
    }
    if (!formData.issueDate) {
      newErrors.issueDate = 'Issue Date is required'
    }
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry Date is required'
    }
    // Cover Class is now optional
    // Amount is now optional
    // Mode of Payment is now optional

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    if (!application) return

    setIsLoading(true)
    try {
      const payload = new FormData()
      payload.append('name', formData.name)
      payload.append('father_name', formData.fatherName)
      payload.append('contact_no', formData.contactNo)
      payload.append('dob', formData.dob)
      payload.append('blood_group', formData.bloodGroup)
      payload.append('state', formData.state)
      payload.append('city', formData.city)
      payload.append('vendor', formData.vendor)
      payload.append('license_type', formData.licenseType)
      payload.append('application_no', formData.applicationNo)
      payload.append('license_no', formData.licenseNo)
      payload.append('issue_date', formData.issueDate)
      payload.append('expiry_date', formData.expiryDate)
      payload.append('cover_class', formData.coverClass)
      payload.append('amount', formData.amount)
      payload.append('pay_amount', formData.payAmount)
      payload.append('mode_of_payment', formData.modeOfPayment)
      
      // Add file uploads if new files are selected
      if (licenseFile) payload.append('license_attachment', licenseFile)
      if (paymentFile) payload.append('payment_receipt', paymentFile)

      await apiService.updateApplication(application.id, payload)
      
      onUpdate()
      onClose()
    } catch (error: unknown) {
      console.error('Failed to update application:', error)
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to update application' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: '',
        fatherName: '',
        contactNo: '',
        dob: '',
        bloodGroup: '',
        state: '',
        city: '',
        vendor: '',
        licenseType: '',
        applicationNo: '',
        licenseNo: '',
        issueDate: '',
        expiryDate: '',
        coverClass: '',
        amount: '',
        payAmount: '',
        modeOfPayment: ''
      })
      setErrors({})
      onClose()
    }
  }

  if (!isOpen || !application) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Edit Application</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              disabled={isLoading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vendor Selection */}
            <div className="space-y-2">
              <Label htmlFor="vendor">Select Vendor</Label>
              <Select value={formData.vendor} onValueChange={(value) => handleInputChange('vendor', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingVendors ? "Loading vendors..." : "Select a vendor"} />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.vendor_id} value={vendor.name}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vendor && <p className="text-sm text-red-600 dark:text-red-400">{errors.vendor}</p>}
            </div>

            {/* License Type */}
            <div className="space-y-2">
              <Label htmlFor="licenseType">Type of License *</Label>
              <Select value={formData.licenseType} onValueChange={(value) => handleInputChange('licenseType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type of license" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light-to-heavy">Light to Heavy</SelectItem>
                  <SelectItem value="direct-heavy">Direct Heavy</SelectItem>
                  <SelectItem value="light-license-renewal">Light License or Renewal</SelectItem>
                  <SelectItem value="correction">Correction</SelectItem>
                </SelectContent>
              </Select>
              {errors.licenseType && <p className="text-sm text-red-600 dark:text-red-400">{errors.licenseType}</p>}
            </div>

            {/* Personal Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
                {errors.name && <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fatherName">Father Name *</Label>
                <Input
                  id="fatherName"
                  type="text"
                  value={formData.fatherName}
                  onChange={(e) => handleInputChange('fatherName', e.target.value)}
                />
                {errors.fatherName && <p className="text-sm text-red-600 dark:text-red-400">{errors.fatherName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNo">Contact Number *</Label>
                <Input
                  id="contactNo"
                  type="tel"
                  placeholder="Enter 10-digit contact number"
                  value={formData.contactNo}
                  onChange={(e) => handleInputChange('contactNo', e.target.value)}
                  maxLength={10}
                  pattern="[0-9]{10}"
                  inputMode="numeric"
                />
                {errors.contactNo ? (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.contactNo}</p>
                ) : formData.contactNo && formData.contactNo.length < 10 ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    {10 - formData.contactNo.length} more digits required
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                />
                {errors.dob && <p className="text-sm text-red-600 dark:text-red-400">{errors.dob}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group *</Label>
                <Select value={formData.bloodGroup} onValueChange={(value) => handleInputChange('bloodGroup', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
                {errors.bloodGroup && <p className="text-sm text-red-600 dark:text-red-400">{errors.bloodGroup}</p>}
              </div>
            </div>

            {/* Address Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select value={formData.state} onValueChange={handleStateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && <p className="text-sm text-red-600 dark:text-red-400">{errors.state}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <div className="flex gap-2">
                  {/* City Display Box */}
                  <div className="flex-1">
                    <Input
                      id="city"
                      type="text"
                      value={formData.city || ''}
                      placeholder="City name"
                      readOnly
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                  </div>
                  
                  {/* City Dropdown Button */}
                  <Select 
                    value="" 
                    onValueChange={(value) => handleInputChange('city', value)}
                    disabled={!formData.state || loadingCities}
                  >
                    <SelectTrigger className="w-12">
                      <SelectValue placeholder="▼" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.city && <p className="text-sm text-red-600 dark:text-red-400">{errors.city}</p>}
              </div>
            </div>

            {/* License Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="applicationNo">Application Number</Label>
                <Input
                  id="applicationNo"
                  type="text"
                  value={formData.applicationNo}
                  onChange={(e) => handleInputChange('applicationNo', e.target.value)}
                />
                {errors.applicationNo && <p className="text-sm text-red-600 dark:text-red-400">{errors.applicationNo}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licenseNo">License Number *</Label>
                  <Input
                    id="licenseNo"
                    type="text"
                    value={formData.licenseNo}
                    onChange={(e) => handleInputChange('licenseNo', e.target.value)}
                  />
                  {errors.licenseNo && <p className="text-sm text-red-600 dark:text-red-400">{errors.licenseNo}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date *</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => handleInputChange('issueDate', e.target.value)}
                  />
                  {errors.issueDate && <p className="text-sm text-red-600 dark:text-red-400">{errors.issueDate}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date *</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  />
                  {errors.expiryDate && <p className="text-sm text-red-600 dark:text-red-400">{errors.expiryDate}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coverClass">Cover/Class</Label>
                  <Input
                    id="coverClass"
                    type="text"
                    value={formData.coverClass}
                    onChange={(e) => handleInputChange('coverClass', e.target.value)}
                  />
                  {errors.coverClass && <p className="text-sm text-red-600 dark:text-red-400">{errors.coverClass}</p>}
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                />
                {errors.amount && <p className="text-sm text-red-600 dark:text-red-400">{errors.amount}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="payAmount">Pay Amount</Label>
                <Input
                  id="payAmount"
                  type="number"
                  value={formData.payAmount}
                  onChange={(e) => handleInputChange('payAmount', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modeOfPayment">Mode of Payment</Label>
                <Select
                  value={formData.modeOfPayment}
                  onValueChange={(value) => handleInputChange('modeOfPayment', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode of payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank-transfer">Transfer to Bank</SelectItem>
                  </SelectContent>
                </Select>
                {errors.modeOfPayment && <p className="text-sm text-red-600 dark:text-red-400">{errors.modeOfPayment}</p>}
              </div>
            </div>

            {/* Attachments Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Attachments</h3>
              
              {/* License Attachment */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">License Attachment</h4>
                {application?.license_attachment_path ? (
                  <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
                    <div className="flex items-center space-x-3 mb-3">
                      <FileImage className="w-8 h-8 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {application.license_attachment_path.split('/').pop()}
                        </p>
                        <p className="text-xs text-gray-500">License Document</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const url = getImageUrl(application.license_attachment_path);
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
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          document.getElementById('license-file-upload')?.click()
                        }}
                        className="flex items-center space-x-1"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Edit</span>
                      </Button>
                    </div>
                    {licenseFile && (
                      <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                        <p className="text-sm text-green-800 dark:text-green-200">
                          New file selected: {licenseFile.name}
                        </p>
                      </div>
                    )}
                    {/* Hidden file input for existing attachments */}
                    <input
                      type="file"
                      id="license-file-upload"
                      className="hidden"
                      onChange={handleLicenseInput}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActiveLicense 
                          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      onDragEnter={handleLicenseDrag}
                      onDragLeave={handleLicenseDrag}
                      onDragOver={handleLicenseDrag}
                      onDrop={handleLicenseDrop}
                    >
                      <input
                        type="file"
                        id="license-file-upload"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleLicenseInput}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-gray-400" />
                        <p className="text-lg font-medium text-foreground">
                          Upload license attachment{' '}
                          <span className="text-primary cursor-pointer hover:underline">
                            here
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Or you can drag and drop your file
                        </p>
                      </div>
                      
                      {licenseFile && (
                        <div className="flex items-center justify-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md mt-3">
                          <FileImage className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-800 dark:text-green-200 font-medium">
                            {licenseFile.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Receipt */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Payment Receipt</h4>
                {application?.payment_receipt_path ? (
                  <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
                    <div className="flex items-center space-x-3 mb-3">
                      <FileImage className="w-8 h-8 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {application.payment_receipt_path.split('/').pop()}
                        </p>
                        <p className="text-xs text-gray-500">Payment Receipt</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const url = getImageUrl(application.payment_receipt_path);
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
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          document.getElementById('payment-file-upload')?.click()
                        }}
                        className="flex items-center space-x-1"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Edit</span>
                      </Button>
                    </div>
                    {paymentFile && (
                      <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                        <p className="text-sm text-green-800 dark:text-green-200">
                          New file selected: {paymentFile.name}
                        </p>
                      </div>
                    )}
                    {/* Hidden file input for existing attachments */}
                    <input
                      type="file"
                      id="payment-file-upload"
                      className="hidden"
                      onChange={handlePaymentInput}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActivePayment 
                          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      onDragEnter={handlePaymentDrag}
                      onDragLeave={handlePaymentDrag}
                      onDragOver={handlePaymentDrag}
                      onDrop={handlePaymentDrop}
                    >
                      <input
                        type="file"
                        id="payment-file-upload"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handlePaymentInput}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-gray-400" />
                        <p className="text-lg font-medium text-foreground">
                          Upload payment receipt{' '}
                          <span className="text-primary cursor-pointer hover:underline">
                            here
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Or you can drag and drop your file
                        </p>
                      </div>
                      
                      {paymentFile && (
                        <div className="flex items-center justify-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md mt-3">
                          <FileImage className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-800 dark:text-green-200 font-medium">
                            {paymentFile.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
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
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isLoading ? 'Updating...' : 'Update Application'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
