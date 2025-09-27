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

  // simple toast state
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    if (!showToast) return
    const t = setTimeout(() => setShowToast(false), 3000)
    return () => clearTimeout(t)
  }, [showToast])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = new FormData()
    payload.append('name', formData.name)
    payload.append('father_name', formData.fatherName)
    payload.append('contact_no', formData.contactNo)
    payload.append('dob', formData.dob)
    payload.append('blood_group', formData.bloodGroup)
    payload.append('state', formData.state)
    payload.append('city', formData.city)
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
      setToastMessage('Application submitted successfully')
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
    } catch (error) {
      console.error('Failed to submit application:', error)
      setToastMessage('Failed to submit application')
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
            {/* License Type - moved to top */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground border-b pb-2">
                License Type
              </h2>

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
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fatherName">Father Name *</Label>
                  <Input
                    id="fatherName"
                    type="text"
                    placeholder="Enter father's name"
                    value={formData.fatherName}
                    onChange={(e) => handleInputChange('fatherName', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Row 2: three columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contactNo">Contact Number *</Label>
                  <Input
                    id="contactNo"
                    type="tel"
                    placeholder="Enter contact number"
                    value={formData.contactNo}
                    onChange={(e) => handleInputChange('contactNo', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                    required
                  />
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
                    <SelectTrigger className="w-full">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Select 
                    value={formData.city} 
                    onValueChange={(value) => handleInputChange('city', value)}
                    disabled={!formData.state || loadingCities}
                  >
                    <SelectTrigger className="w-full">
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
                  <Label htmlFor="applicationNo">Application Number *</Label>
                  <Input
                    id="applicationNo"
                    type="text"
                    placeholder="Enter application number"
                    value={formData.applicationNo}
                    onChange={(e) => handleInputChange('applicationNo', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coverClass">Cover/Class *</Label>
                  <Input
                    id="coverClass"
                    type="text"
                    placeholder="Enter cover/class"
                    value={formData.coverClass}
                    onChange={(e) => handleInputChange('coverClass', e.target.value)}
                    required
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
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date *</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => handleInputChange('issueDate', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date *</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    required
                  />
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
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payAmount">Pay Amount *</Label>
                  <Input
                    id="payAmount"
                    type="number"
                    placeholder="Enter pay amount"
                    value={formData.payAmount}
                    onChange={(e) => handleInputChange('payAmount', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modeOfPayment">Mode of Payment *</Label>
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

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-card text-card-foreground border px-4 py-3 rounded shadow-lg">
            <span className="text-sm">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default DrivingLicenseApplicationForm