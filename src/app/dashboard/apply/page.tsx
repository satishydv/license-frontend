"use client"

import React, { useState, useEffect, useCallback } from 'react'
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
import { Cloud, FileText } from 'lucide-react'

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

const DrivingLicenseApplicationForm = () => {
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

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [paymentReceiptFile, setPaymentReceiptFile] = useState<File | null>(null)
  const [dragActiveReceipt, setDragActiveReceipt] = useState(false)
  const [cities, setCities] = useState<string[]>([])
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadedState, setLoadedState] = useState<string>('')
  const [vendors, setVendors] = useState<Array<{vendor_id: number, name: string}>>([])
  const [loadingVendors, setLoadingVendors] = useState(false)

  // enhanced toast state
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  
  // validation state
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!showToast) return
    const t = setTimeout(() => setShowToast(false), 3000)
    return () => clearTimeout(t)
  }, [showToast])

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

  const fetchCities = useCallback(async (state: string) => {
    if (!state || state === loadedState) return
    setLoadingCities(true)
    try {
      const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost/driving-license/index.php/api').replace(/\/$/, '')
      const response = await fetch(`${apiBase}/cities?state=${encodeURIComponent(state)}`)
      if (response.ok) {
        const data = await response.json()
        // Handle both array response (from old API) and object response (from new API)
        if (Array.isArray(data)) {
          setCities(data)
        } else if (data && Array.isArray(data.cities)) {
          setCities(data.cities.map((city: any) => city.city_name))
        } else {
          setCities([])
        }
        setLoadedState(state)
      } else {
        console.error('Failed to fetch cities:', response.status, response.statusText)
        setCities([])
      }
    } catch (error) {
      console.error('Error fetching cities:', error)
      setCities([])
    } finally {
      setLoadingCities(false)
    }
  }, [loadedState])

  const fetchVendors = useCallback(async () => {
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
  }, [])

  // Fetch vendors on component mount
  useEffect(() => {
    fetchVendors()
  }, [fetchVendors])

  const handleStateChange = (state: string) => {
    handleInputChange('state', state)
    handleInputChange('city', '') // Clear city when state changes
    setCities([]) // Clear cities list
    setLoadedState('') // Reset loaded state
    // Only fetch cities if state is not empty
    if (state.trim()) {
      fetchCities(state)
    }
  }

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  // Payment receipt upload handlers
  const handleReceiptUpload = (file: File) => {
    setPaymentReceiptFile(file)
  }

  const handleReceiptDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveReceipt(true)
    } else if (e.type === "dragleave") {
      setDragActiveReceipt(false)
    }
  }

  const handleReceiptDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActiveReceipt(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleReceiptUpload(e.dataTransfer.files[0])
    }
  }

  const handleReceiptInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleReceiptUpload(e.target.files[0])
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Required text fields
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!formData.fatherName.trim()) {
      newErrors.fatherName = 'Father name is required'
    }
    if (!formData.contactNo.trim()) {
      newErrors.contactNo = 'Contact number is required'
    } else if (formData.contactNo.length < 10) {
      newErrors.contactNo = 'Contact number must be 10 digits'
    }
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required'
    }
    if (!formData.licenseNo.trim()) {
      newErrors.licenseNo = 'License number is required'
    }
    if (!formData.issueDate) {
      newErrors.issueDate = 'Issue date is required'
    }
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required'
    }

    // Required dropdown fields
    if (!formData.licenseType) {
      newErrors.licenseType = 'Please select a license type'
    }
    if (!formData.bloodGroup) {
      newErrors.bloodGroup = 'Please select a blood group'
    }
    if (!formData.state) {
      newErrors.state = 'Please select a state'
    }
    if (!formData.city) {
      newErrors.city = 'Please select a city'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form before submission
    if (!validateForm()) {
      setToastMessage('❌ Please fill in all required fields')
      setToastType('error')
      setShowToast(true)
      return
    }
    
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
    if (uploadedFile) payload.append('license_attachment', uploadedFile)
    if (paymentReceiptFile) payload.append('payment_receipt', paymentReceiptFile)

    try {
      await apiService.createApplication(payload)
      setToastMessage('Application submitted successfully! 🎉')
      setToastType('success')
      setShowToast(true)

      // reset form for a fresh start
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
      setUploadedFile(null)
      setPaymentReceiptFile(null)
      setCities([])
      setLoadedState('') // Reset loaded state to allow cities to be fetched again
      setErrors({}) // Clear validation errors
    } catch (error: any) {
      console.error('Failed to submit application:', error)
      
      // Extract error message from API response
      let errorMessage = 'Failed to submit application'
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      // Add more specific error handling
      if (errorMessage.includes('Validation failed')) {
        errorMessage = 'Please check all required fields and try again'
      } else if (errorMessage.includes('Database')) {
        errorMessage = 'Database error occurred. Please try again later'
      } else if (errorMessage.includes('Network')) {
        errorMessage = 'Network error. Please check your connection'
      }
      
      setToastMessage(`❌ ${errorMessage}`)
      setToastType('error')
      setShowToast(true)
    }
  }

 

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="w-full max-w-none mx-auto">
        <div className="bg-card rounded-lg shadow-sm border p-8">
          {/* Header */}
          <div className="text-center mb-8">
           
            <p className="text-muted-foreground">
              Complete the form below to apply for your driving license
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Vendor and License Type Section - Two columns in one row */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground border-b pb-2">
                Application Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>

                {/* License Type */}
                <div className="space-y-2">
                  <Label htmlFor="licenseType">Type of License *</Label>
                  <Select value={formData.licenseType} onValueChange={(value) => handleInputChange('licenseType', value)}>
                    <SelectTrigger className={errors.licenseType ? 'border-red-500 focus:border-red-500' : ''}>
                      <SelectValue placeholder="Select type of license" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light-to-heavy">Light to Heavy</SelectItem>
                      <SelectItem value="direct-heavy">Direct Heavy</SelectItem>
                      <SelectItem value="light-license-renewal">Light License or Renewal</SelectItem>
                      <SelectItem value="correction">Correction</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.licenseType && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.licenseType}</p>
                  )}
                </div>
              </div>
            </div>
            {/* Personal Details Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground border-b pb-2">
                Personal Details
              </h2>
              
              {/* Row 1: two columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={errors.name ? 'border-red-500 focus:border-red-500' : ''}
                    required
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fatherName">Father Name *</Label>
                  <Input
                    id="fatherName"
                    type="text"
                    placeholder="Enter father's name"
                    value={formData.fatherName}
                    onChange={(e) => handleInputChange('fatherName', e.target.value)}
                    className={errors.fatherName ? 'border-red-500 focus:border-red-500' : ''}
                    required
                  />
                  {errors.fatherName && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.fatherName}</p>
                  )}
                </div>
              </div>

              {/* Row 2: three columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    className={errors.contactNo ? 'border-red-500 focus:border-red-500' : ''}
                    required
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
                    className={errors.dob ? 'border-red-500 focus:border-red-500' : ''}
                    required
                  />
                  {errors.dob && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.dob}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group *</Label>
                  <Select value={formData.bloodGroup} onValueChange={(value) => handleInputChange('bloodGroup', value)}>
                    <SelectTrigger className={errors.bloodGroup ? 'border-red-500 focus:border-red-500' : ''}>
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
                  {errors.bloodGroup && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.bloodGroup}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground border-b pb-2">
                Address Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select value={formData.state} onValueChange={handleStateChange}>
                    <SelectTrigger className={`w-full ${errors.state ? 'border-red-500 focus:border-red-500' : ''}`}>
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
                  {errors.state && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.state}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Select 
                    value={formData.city} 
                    onValueChange={(value) => handleInputChange('city', value)}
                    disabled={!formData.state || loadingCities}
                  >
                    <SelectTrigger className={`w-full ${errors.city ? 'border-red-500 focus:border-red-500' : ''}`}>
                      <SelectValue placeholder={
                        !formData.state 
                          ? "Select state first" 
                          : loadingCities 
                            ? "Loading cities..." 
                            : "Select your city"
                      } />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.city && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.city}</p>
                  )}
                </div>
              </div>
            </div>

            {/* License Information Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground border-b pb-2">
                License Information
              </h2>
              
              

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="applicationNo">Application Number</Label>
                  <Input
                    id="applicationNo"
                    type="text"
                    placeholder="Enter application number"
                    value={formData.applicationNo}
                    onChange={(e) => handleInputChange('applicationNo', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coverClass">Cover/Class</Label>
                  <Input
                    id="coverClass"
                    type="text"
                    placeholder="Enter cover/class"
                    value={formData.coverClass}
                    onChange={(e) => handleInputChange('coverClass', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="licenseNo">License Number *</Label>
                  <Input
                    id="licenseNo"
                    type="text"
                    placeholder="Enter license number"
                    value={formData.licenseNo}
                    onChange={(e) => handleInputChange('licenseNo', e.target.value)}
                    className={errors.licenseNo ? 'border-red-500 focus:border-red-500' : ''}
                    required
                  />
                  {errors.licenseNo && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.licenseNo}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date *</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => handleInputChange('issueDate', e.target.value)}
                    className={errors.issueDate ? 'border-red-500 focus:border-red-500' : ''}
                    required
                  />
                  {errors.issueDate && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.issueDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date *</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    className={errors.expiryDate ? 'border-red-500 focus:border-red-500' : ''}
                    required
                  />
                  {errors.expiryDate && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.expiryDate}</p>
                  )}
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground border-b pb-2">
                Upload Your Attachment
              </h2>
              
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-border/80'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileInput}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Cloud className="h-12 w-12 text-primary" />
                  </div>
                  
                  <div>
                    <p className="text-lg font-medium text-foreground">
                      Upload your files{' '}
                      <span className="text-primary cursor-pointer hover:underline">
                        here
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Or you can drag and drop your file
                    </p>
                  </div>
                  
                  {uploadedFile && (
                    <div className="flex items-center justify-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                      <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-800 dark:text-green-200 font-medium">
                        {uploadedFile.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Amount Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground border-b pb-2">
                Payment Information
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                  />
                </div>

              <div className="space-y-2">
                <Label htmlFor="payAmount">Pay Amount</Label>
                  <Input
                    id="payAmount"
                    type="number"
                    placeholder="Enter pay amount"
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
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select mode of payment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="bank-transfer">Transfer to Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Payment Receipt Upload Box */}
              <div className="space-y-2">
                <Label htmlFor="payment-receipt">Please upload your payment receipt.</Label>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActiveReceipt 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-border/80'
                  }`}
                  onDragEnter={handleReceiptDrag}
                  onDragLeave={handleReceiptDrag}
                  onDragOver={handleReceiptDrag}
                  onDrop={handleReceiptDrop}
                >
                  <input
                    type="file"
                    id="payment-receipt"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleReceiptInput}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />

                  <div className="space-y-2">
                    <div className="flex justify-center">
                      <Cloud className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-semibold text-foreground">Browse Files</p>
                    <p className="text-sm text-muted-foreground">Drag and drop files here</p>
                  </div>

                  {paymentReceiptFile && (
                    <div className="mt-4 flex items-center justify-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                      <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-800 dark:text-green-200 font-medium">
                        {paymentReceiptFile.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>


            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <Button 
                type="submit" 
                size="lg" 
                className="px-12 py-3 text-lg font-medium"
              >
                Submit Application
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Enhanced Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className={`
            px-4 py-3 rounded-lg shadow-lg border-2 max-w-md
            ${toastType === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200' 
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
            }
            animate-in slide-in-from-right-full duration-300
          `}>
            <div className="flex items-center gap-2">
              {toastType === 'success' ? (
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✕</span>
                </div>
              )}
              <span className="text-sm font-medium">{toastMessage}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DrivingLicenseApplicationForm