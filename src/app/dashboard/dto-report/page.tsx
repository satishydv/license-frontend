"use client"

import React, { useState, useEffect } from 'react'
import { Calendar, DollarSign, Users, TrendingUp, FileText, Receipt } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { apiService } from '@/lib/api'

interface DTOReportData {
  totalAmount: number
  totalPayAmount: number
  totalApplicants: number
  dtoCount: number
  period: string
  averageAmount: number
  averagePayAmount: number
  averageApplicants: number
  outstandingAmount: number
}

const DTOReportPage = () => {
  const [fromDate, setFromDate] = useState<Date>()
  const [toDate, setToDate] = useState<Date>()
  const [dtoData, setDtoData] = useState<DTOReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Set default dates to current month
  useEffect(() => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    setFromDate(firstDay)
    setToDate(lastDay)
  }, [])

  // Fetch data when dates change
  useEffect(() => {
    if (fromDate && toDate) {
      fetchDTOData()
    }
  }, [fromDate, toDate])

  const fetchDTOData = async () => {
    if (!fromDate || !toDate) return

    try {
      setLoading(true)
      setError(null)
      
      const fromDateStr = format(fromDate, 'yyyy-MM-dd')
      const toDateStr = format(toDate, 'yyyy-MM-dd')
      
      // Use the API service method
      const data = await apiService.getDTOReport(fromDateStr, toDateStr)
      
      setDtoData({
        totalAmount: data.total_amount || 0,
        totalPayAmount: data.total_pay_amount || 0,
        totalApplicants: data.total_applicants || 0,
        dtoCount: data.dto_count || 0,
        period: `${format(fromDate, 'dd/MM/yyyy')} - ${format(toDate, 'dd/MM/yyyy')}`,
        averageAmount: data.dto_count > 0 ? (data.total_amount / data.dto_count) : 0,
        averagePayAmount: data.dto_count > 0 ? (data.total_pay_amount / data.dto_count) : 0,
        averageApplicants: data.dto_count > 0 ? (data.total_applicants / data.dto_count) : 0,
        outstandingAmount: (data.total_amount || 0) - (data.total_pay_amount || 0)
      })
    } catch (error) {
      console.error('Error fetching DTO data:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
      // Fallback to mock data for demo
      setDtoData({
        totalAmount: 5000,
        totalPayAmount: 3500,
        totalApplicants: 55,
        dtoCount: 1,
        period: `${format(fromDate, 'dd/MM/yyyy')} - ${format(toDate, 'dd/MM/yyyy')}`,
        averageAmount: 5000,
        averagePayAmount: 3500,
        averageApplicants: 55,
        outstandingAmount: 1500
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
    fetchDTOData()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">DTO Report</h1>
          <p className="text-muted-foreground">View DTO transactions and financial summary for selected date range</p>
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
            Choose the period for which you want to view DTO transactions
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

      {/* DTO Report Display */}
      {dtoData && (
        <div className="space-y-6">
          {/* Main Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Amount Card */}
            <Card className="border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                <DollarSign className="h-8 w-8 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{formatCurrency(dtoData.totalAmount)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Period: {dtoData.period}
                </p>
              </CardContent>
            </Card>

            {/* Total Pay Amount Card */}
            <Card className="border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pay Amount</CardTitle>
                <Receipt className="h-8 w-8 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{formatCurrency(dtoData.totalPayAmount)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Amount actually paid
                </p>
              </CardContent>
            </Card>

            {/* Total Applicants Card */}
            <Card className="border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
                <Users className="h-8 w-8 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{dtoData.totalApplicants}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total number of applicants
                </p>
              </CardContent>
            </Card>

            {/* DTO Count Card */}
            <Card className="border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">DTO Records</CardTitle>
                <FileText className="h-8 w-8 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{dtoData.dtoCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Number of DTO transactions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Average Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Average Amount Card */}
            <Card className="border-indigo-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Amount per DTO</CardTitle>
                <TrendingUp className="h-8 w-8 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-600">
                  {formatCurrency(dtoData.averageAmount)}
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
                  {formatCurrency(dtoData.averagePayAmount)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Average payment received
                </p>
              </CardContent>
            </Card>

            {/* Average Applicants Card */}
            <Card className="border-pink-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Applicants per DTO</CardTitle>
                <Users className="h-8 w-8 text-pink-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-pink-600">
                  {Math.round(dtoData.averageApplicants)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Average applicants per transaction
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Outstanding Amount Alert */}
          {dtoData.outstandingAmount > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-red-600" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Outstanding Amount</h4>
                    <p className="text-sm text-red-700 mt-1">
                      There is an outstanding amount of {formatCurrency(dtoData.outstandingAmount)} 
                      (Total: {formatCurrency(dtoData.totalAmount)} - Paid: {formatCurrency(dtoData.totalPayAmount)})
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Paid Message */}
          {dtoData.outstandingAmount <= 0 && dtoData.totalAmount > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-green-800">All Payments Complete!</h4>
                    <p className="text-sm text-green-700 mt-1">
                      All DTO transactions are fully paid. Total amount: {formatCurrency(dtoData.totalAmount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Data Message */}
          {dtoData.dtoCount === 0 && (
            <Card className="border-gray-200 bg-gray-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-800">No DTO Records Found</h4>
                    <p className="text-sm text-gray-700 mt-1">
                      No DTO transactions found for the selected period.
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
                <p className="text-sm text-muted-foreground">Loading DTO data...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DTOReportPage
