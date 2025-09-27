"use client"

import React, { useState, useEffect } from 'react'
import { Calendar, CreditCard, TrendingUp, FileText, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { apiService } from '@/lib/api'

interface DueData {
  totalDues: number
  applicationCount: number
  period: string
  averageDue: number
}

const DueReportPage = () => {
  const [fromDate, setFromDate] = useState<Date>()
  const [toDate, setToDate] = useState<Date>()
  const [dueData, setDueData] = useState<DueData | null>(null)
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
      fetchDueData()
    }
  }, [fromDate, toDate])

  const fetchDueData = async () => {
    if (!fromDate || !toDate) return

    try {
      setLoading(true)
      setError(null)
      
      const fromDateStr = format(fromDate, 'yyyy-MM-dd')
      const toDateStr = format(toDate, 'yyyy-MM-dd')
      
      // Use the API service method
      const data = await apiService.getDueReport(fromDateStr, toDateStr)
      
      setDueData({
        totalDues: data.total_dues || 0,
        applicationCount: data.application_count || 0,
        period: `${format(fromDate, 'dd/MM/yyyy')} - ${format(toDate, 'dd/MM/yyyy')}`,
        averageDue: data.application_count > 0 ? (data.total_dues / data.application_count) : 0
      })
    } catch (error) {
      console.error('Error fetching due data:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
      // Fallback to mock data for demo
      setDueData({
        totalDues: 450000,
        applicationCount: 25,
        period: `${format(fromDate, 'dd/MM/yyyy')} - ${format(toDate, 'dd/MM/yyyy')}`,
        averageDue: 18000
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
    fetchDueData()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Outstanding Dues Report</h1>
          <p className="text-muted-foreground">View outstanding dues for selected date range</p>
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
            Choose the period for which you want to view outstanding dues
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

      {/* Due Display */}
      {dueData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Dues Card */}
          <Card className="border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Outstanding Dues</CardTitle>
              <CreditCard className="h-8 w-8 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{formatCurrency(dueData.totalDues)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Period: {dueData.period}
              </p>
            </CardContent>
          </Card>

          {/* Applications with Dues Card */}
          <Card className="border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications with Dues</CardTitle>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{dueData.applicationCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Applications with outstanding payments
              </p>
            </CardContent>
          </Card>

          {/* Average Due Card */}
          <Card className="border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Due per Application</CardTitle>
              <TrendingUp className="h-8 w-8 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {formatCurrency(dueData.averageDue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Average outstanding amount
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Warning Alert */}
      {dueData && dueData.totalDues > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <h4 className="text-sm font-medium text-orange-800">Outstanding Dues Alert</h4>
                <p className="text-sm text-orange-700 mt-1">
                  There are {dueData.applicationCount} applications with outstanding dues totaling {formatCurrency(dueData.totalDues)}. 
                  Consider following up with these applications.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Dues Message */}
      {dueData && dueData.totalDues === 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-green-800">All Clear!</h4>
                <p className="text-sm text-green-700 mt-1">
                  No outstanding dues found for the selected period. All applications are fully paid.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading due data...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DueReportPage
