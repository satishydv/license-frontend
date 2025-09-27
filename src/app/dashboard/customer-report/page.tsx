"use client"

import React, { useState } from 'react'
import { Calendar, Search, User, Phone, FileText, Hash, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { apiService } from '@/lib/api'
import { DataTable } from '@/components/tables/data-table'
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, MoreHorizontal, Eye } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface CustomerSearchParams {
  from_date?: string
  to_date?: string
  name?: string
  phone?: string
  license_no?: string
  application_no?: string
}

interface CustomerApplication {
  id: number
  application_no: string
  name: string
  phone: string
  email: string
  license_no: string
  amount: number
  pay_amount: number
  status: string
  created_at: string
  updated_at: string
}

// Define columns directly in the file
const createCustomerColumns = (): ColumnDef<CustomerApplication>[] => [
  {
    accessorKey: "application_no",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          App No
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium text-blue-600 text-sm">
        {row.getValue("application_no")}
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Name
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium text-sm">
        {row.getValue("name")}
      </div>
    ),
    size: 150,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <div className="text-muted-foreground text-sm">
        {row.getValue("phone")}
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: "license_no",
    header: "License No",
    cell: ({ row }) => (
      <div className="font-mono text-xs">
        {row.getValue("license_no")}
      </div>
    ),
    size: 130,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Total
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount)
      return <div className="font-medium text-sm">{formatted}</div>
    },
    size: 100,
  },
  {
    accessorKey: "pay_amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Paid
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("pay_amount"))
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount)
      return <div className="font-medium text-green-600 text-sm">{formatted}</div>
    },
    size: 100,
  },
  {
    id: "outstanding",
    header: "Due",
    cell: ({ row }) => {
      const totalAmount = parseFloat(row.getValue("amount"))
      const paidAmount = parseFloat(row.getValue("pay_amount"))
      const outstanding = totalAmount - paidAmount
      
      if (outstanding <= 0) {
        return <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">Paid</Badge>
      }
      
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(outstanding)
      
      return <div className="font-medium text-red-600 text-sm">{formatted}</div>
    },
    size: 100,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Date
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      return <div className="text-muted-foreground text-sm">{date.toLocaleDateString()}</div>
    },
    size: 100,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const application = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-6 w-6 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(application.application_no)}
            >
              Copy application number
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    size: 50,
  },
]

const CustomerReportPage = () => {
  const [fromDate, setFromDate] = useState<Date>()
  const [toDate, setToDate] = useState<Date>()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [licenseNo, setLicenseNo] = useState('')
  const [applicationNo, setApplicationNo] = useState('')
  const [searchResults, setSearchResults] = useState<CustomerApplication[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [usingMockData, setUsingMockData] = useState(false)

  const handleSearch = async () => {
    try {
      setLoading(true)
      setError(null)
      setHasSearched(true)
      
      const searchParams: CustomerSearchParams = {}
      
      if (fromDate) {
        searchParams.from_date = format(fromDate, 'yyyy-MM-dd')
      }
      if (toDate) {
        searchParams.to_date = format(toDate, 'yyyy-MM-dd')
      }
      if (name.trim()) {
        searchParams.name = name.trim()
      }
      if (phone.trim()) {
        searchParams.phone = phone.trim()
      }
      if (licenseNo.trim()) {
        searchParams.license_no = licenseNo.trim()
      }
      if (applicationNo.trim()) {
        searchParams.application_no = applicationNo.trim()
      }
      
      // Check if at least one search parameter is provided
      if (Object.keys(searchParams).length === 0) {
        setError('Please provide at least one search criteria')
        return
      }
      
      console.log('Searching with params:', searchParams)
      
      // Try the API call first
      try {
        const results = await apiService.searchCustomers(searchParams)
        console.log('Search results:', results)
        setSearchResults(results)
        setUsingMockData(false)
        return // Success, exit early
      } catch (apiError) {
        console.error('API Error:', apiError)
        console.log('API failed, using mock data for development')
        setUsingMockData(true)
        
        // Use mock data as fallback
        setSearchResults([
          {
            id: 1,
            application_no: 'APP001',
            name: 'John Doe',
            phone: '1234567890',
            email: 'john@example.com',
            license_no: 'DL123456',
            amount: 5000,
            pay_amount: 3000,
            status: 'pending',
            created_at: '2025-01-15T10:30:00Z',
            updated_at: '2025-01-15T10:30:00Z'
          },
          {
            id: 2,
            application_no: 'APP002',
            name: 'Jane Smith',
            phone: '9876543210',
            email: 'jane@example.com',
            license_no: 'DL789012',
            amount: 7500,
            pay_amount: 7500,
            status: 'approved',
            created_at: '2025-01-14T14:20:00Z',
            updated_at: '2025-01-14T14:20:00Z'
          },
          {
            id: 3,
            application_no: 'APP003',
            name: 'Mike Johnson',
            phone: '5555555555',
            email: 'mike@example.com',
            license_no: 'DL345678',
            amount: 6000,
            pay_amount: 2000,
            status: 'pending',
            created_at: '2025-01-13T09:15:00Z',
            updated_at: '2025-01-13T09:15:00Z'
          }
        ])
        setError(null)
        return
      }
      
    } catch (error) {
      console.error('Unexpected error in handleSearch:', error)
      setError('An unexpected error occurred. Please try again.')
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleClearSearch = () => {
    setFromDate(undefined)
    setToDate(undefined)
    setName('')
    setPhone('')
    setLicenseNo('')
    setApplicationNo('')
    setSearchResults([])
    setError(null)
    setHasSearched(false)
    setUsingMockData(false)
  }

  const columns = createCustomerColumns()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Customer Report</h1>
          <p className="text-muted-foreground">Search and view customer application details</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleClearSearch}>
          <Search className="h-4 w-4 mr-2" />
          Clear Search
        </Button>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Customer Applications
          </CardTitle>
          <CardDescription>
            Enter any combination of search criteria. All fields are optional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <Label>From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "dd/MM/yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={fromDate}
                    onSelect={setFromDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "dd/MM/yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={toDate}
                    onSelect={setToDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Enter customer name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* License Number */}
            <div className="space-y-2">
              <Label htmlFor="license">License Number</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="license"
                  placeholder="Enter license number"
                  value={licenseNo}
                  onChange={(e) => setLicenseNo(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Application Number */}
            <div className="space-y-2">
              <Label htmlFor="application">Application Number</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="application"
                  placeholder="Enter application number"
                  value={applicationNo}
                  onChange={(e) => setApplicationNo(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-center mt-6">
            <Button onClick={handleSearch} disabled={loading} size="lg">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search Applications
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Search Results
              {searchResults.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({searchResults.length} application{searchResults.length !== 1 ? 's' : ''} found)
                </span>
              )}
            </CardTitle>
            {usingMockData && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> API is currently unavailable. Showing sample data for demonstration purposes.
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Searching applications...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-600 mb-2">❌</div>
                <p className="text-red-600 font-medium">Error: {error}</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">🔍</div>
                <p className="text-gray-600 font-medium">No applications found matching your search criteria</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your search parameters</p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <DataTable 
                  columns={columns} 
                  data={searchResults} 
                  searchKey="name"
                  searchPlaceholder="Filter by name..."
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CustomerReportPage
