"use client"

import React, { useState, useEffect } from 'react'
import { Calendar, DollarSign, Users, TrendingUp, FileText, Receipt, Building2, Phone, MapPin } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { apiService } from '@/lib/api'
import { Vendor } from '@/types/vendor'
import { useAuth } from '@/contexts/AuthContext'

interface VendorReportData {
  totalVendors: number
  totalAmount: number
  totalPayAmount: number
  totalCustomers: number
  period: string
  averageAmount: number
  averagePayAmount: number
  averageCustomers: number
  outstandingAmount: number
  vendors: Vendor[]
  topVendors: Array<{
    vendor: Vendor
    totalAmount: number
    totalPayAmount: number
    totalCustomers: number
  }>
}

const VendorReportPage = () => {
  const [fromDate, setFromDate] = useState<Date>()
  const [toDate, setToDate] = useState<Date>()
  const [vendorData, setVendorData] = useState<VendorReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()

  // Set default dates to current month
  useEffect(() => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    setFromDate(firstDay)
    setToDate(lastDay)
  }, [])

  // Fetch data when dates change and user is authenticated
  useEffect(() => {
    if (fromDate && toDate && isAuthenticated) {
      fetchVendorData()
    }
  }, [fromDate, toDate, isAuthenticated])

  const fetchVendorData = async () => {
    if (!fromDate || !toDate) return

    try {
      setLoading(true)
      setError(null)
      
      const fromDateStr = format(fromDate, 'yyyy-MM-dd')
      const toDateStr = format(toDate, 'yyyy-MM-dd')
      
      // Use the new backend vendor report API
      const reportData = await apiService.getVendorReport(fromDateStr, toDateStr)
      
      // Also fetch all vendors for top vendors calculation
      const response = await apiService.getVendors(1, 1000)
      const allVendors = response.vendors || []
      
      // Filter vendors by date range for top vendors
      const filteredVendors = allVendors.filter((vendor: Vendor) => {
        if (!vendor.created_at) return true
        const vendorDate = new Date(vendor.created_at)
        return vendorDate >= fromDate && vendorDate <= toDate
      })
      
      // Calculate top vendors by amount
      const topVendors = filteredVendors
        .map(vendor => ({
          vendor,
          totalAmount: vendor.amount || 0,
          totalPayAmount: vendor.pay_amount || 0,
          totalCustomers: vendor.total_customer || 0
        }))
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 5)
      
      setVendorData({
        totalVendors: reportData.vendor_count,
        totalAmount: reportData.total_amount,
        totalPayAmount: reportData.total_pay_amount,
        totalCustomers: reportData.total_customers,
        period: `${format(fromDate, 'dd/MM/yyyy')} - ${format(toDate, 'dd/MM/yyyy')}`,
        averageAmount: reportData.vendor_count > 0 ? reportData.total_amount / reportData.vendor_count : 0,
        averagePayAmount: reportData.vendor_count > 0 ? reportData.total_pay_amount / reportData.vendor_count : 0,
        averageCustomers: reportData.vendor_count > 0 ? reportData.total_customers / reportData.vendor_count : 0,
        outstandingAmount: reportData.total_amount - reportData.total_pay_amount,
        vendors: filteredVendors,
        topVendors
      })
    } catch (error) {
      console.error('Error fetching vendor data:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
      // Fallback to mock data for demo
      setVendorData({
        totalVendors: 5,
        totalAmount: 25000,
        totalPayAmount: 18000,
        totalCustomers: 120,
        period: `${format(fromDate, 'dd/MM/yyyy')} - ${format(toDate, 'dd/MM/yyyy')}`,
        averageAmount: 5000,
        averagePayAmount: 3600,
        averageCustomers: 24,
        outstandingAmount: 7000,
        vendors: [],
        topVendors: []
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleApplyFilter = () => {
    fetchVendorData()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Vendor Report</h1>
          <p className="text-muted-foreground">View vendor transactions and financial summary for selected date range</p>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Date Range
          </CardTitle>
          <CardDescription>
            Choose the period for which you want to view vendor transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            {/* From Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
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

            {/* To Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
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

            {/* Apply Button */}
            <Button onClick={handleApplyFilter} disabled={!fromDate || !toDate || loading}>
              {loading ? "Loading..." : "Apply Filter"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vendor Report Display */}
      {vendorData && (
        <div className="space-y-6">
          {/* Main Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Vendors Card */}
            <Card className="border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
                <Building2 className="h-8 w-8 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{vendorData.totalVendors}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Period: {vendorData.period}
                </p>
              </CardContent>
            </Card>

            {/* Total Amount Card */}
            <Card className="border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                <DollarSign className="h-8 w-8 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{formatCurrency(vendorData.totalAmount)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total transaction amount
                </p>
              </CardContent>
            </Card>

            {/* Total Pay Amount Card */}
            <Card className="border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pay Amount</CardTitle>
                <Receipt className="h-8 w-8 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{formatCurrency(vendorData.totalPayAmount)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Amount actually paid
                </p>
              </CardContent>
            </Card>

            {/* Total Customers Card */}
            <Card className="border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-8 w-8 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{vendorData.totalCustomers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total number of customers
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Average Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Average Amount Card */}
            <Card className="border-indigo-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Amount per Vendor</CardTitle>
                <TrendingUp className="h-8 w-8 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-600">
                  {formatCurrency(vendorData.averageAmount)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Average transaction amount
                </p>
              </CardContent>
            </Card>

            {/* Average Pay Amount Card */}
            <Card className="border-teal-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Pay Amount</CardTitle>
                <Receipt className="h-8 w-8 text-teal-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-600">
                  {formatCurrency(vendorData.averagePayAmount)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Average payment received
                </p>
              </CardContent>
            </Card>

            {/* Average Customers Card */}
            <Card className="border-pink-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Customers per Vendor</CardTitle>
                <Users className="h-8 w-8 text-pink-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-pink-600">
                  {Math.round(vendorData.averageCustomers)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Average customers per vendor
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Vendors Section */}
          {vendorData.topVendors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Vendors by Amount
                </CardTitle>
                <CardDescription>
                  Top 5 vendors with highest transaction amounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendorData.topVendors.map((item, index) => (
                    <div key={item.vendor.vendor_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold">{item.vendor.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {item.vendor.phone_no}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {item.vendor.address}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          {formatCurrency(item.totalAmount)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.totalCustomers} customers
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Outstanding Amount Alert */}
          {vendorData.outstandingAmount > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-red-600" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Outstanding Amount</h4>
                    <p className="text-sm text-red-700 mt-1">
                      There is an outstanding amount of {formatCurrency(vendorData.outstandingAmount)} 
                      (Total: {formatCurrency(vendorData.totalAmount)} - Paid: {formatCurrency(vendorData.totalPayAmount)})
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Paid Message */}
          {vendorData.outstandingAmount <= 0 && vendorData.totalAmount > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-green-800">All Payments Complete!</h4>
                    <p className="text-sm text-green-700 mt-1">
                      All vendor transactions are fully paid. Total amount: {formatCurrency(vendorData.totalAmount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Data Message */}
          {vendorData.totalVendors === 0 && (
            <Card className="border-gray-200 bg-gray-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-gray-600" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-800">No Vendor Records Found</h4>
                    <p className="text-sm text-gray-700 mt-1">
                      No vendor transactions found for the selected period.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <span className="text-sm font-medium">Error:</span>
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading vendor data...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default VendorReportPage
