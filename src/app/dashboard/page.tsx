"use client"

import React, { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, FileText, CreditCard, BarChart3, Building2, HandCoins } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChartPieDonutText } from '@/components/Piechart'
import { apiService } from '@/lib/api'

interface ReportData {
  totalApplications: number
  totalIncome: number
  totalDues: number
  totalPaid: number
  applicationsByType: Array<{
    type: string
    count: number
    amount: number
  }>
  paymentMethods: Array<{
    method: string
    count: number
    amount: number
  }>
}

const DashboardPage = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('this_month')

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      const data = await apiService.getReportData(dateRange)
      setReportData(data)
    } catch (error) {
      console.error('Error fetching report data:', error)
      // Fallback to mock data if API fails
      setReportData({
        totalApplications: 120422,
        totalIncome: 8326687,
        totalDues: 2048443,
        totalPaid: 6278244,
        applicationsByType: [
          { type: 'Light Vehicle', count: 45000, amount: 2250000 },
          { type: 'Heavy Vehicle', count: 35000, amount: 3500000 },
          { type: 'Direct Heavy', count: 40422, amount: 2576687 }
        ],
        paymentMethods: [
          { method: 'Cash', count: 60000, amount: 3000000 },
          { method: 'Online', count: 40000, amount: 4000000 },
          { method: 'Card', count: 20422, amount: 1326687 }
        ]
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading report data...</div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Failed to load report data</div>
      </div>
    )
  }

  // Prepare pie chart data for payment methods
  const pieChartData = reportData.paymentMethods.map((method, index) => ({
    browser: method.method,
    visitors: method.amount,
    fill: `var(--color-${['chrome', 'safari', 'firefox'][index] || 'edge'})`
  }))

  const totalAmount = reportData.paymentMethods.reduce((sum, method) => sum + method.amount, 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Financial and application insights</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section - Metric Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total Applications */}
          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Applications</CardTitle>
              <BarChart3 className="h-8 w-8 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatNumber(reportData.totalApplications)}</div>
              <p className="text-xs text-pink-100">
                Compare with last month
              </p>
              <div className="flex items-center mt-2">
                <span className="inline-flex items-center rounded-full bg-white/20 px-2 py-1 text-xs font-medium text-white">
                  +150
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Total Income */}
          <Card className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-black border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black">Total Income</CardTitle>
              <HandCoins className="h-8 w-8 text-black" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{formatCurrency(reportData.totalIncome)}</div>
              <p className="text-xs text-gray-700">
                Compare with last month
              </p>
              <div className="flex items-center mt-2">
                <span className="inline-flex items-center rounded-full bg-black/10 px-2 py-1 text-xs font-medium text-black">
                  +80
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Total Dues */}
          <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-black border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black">Outstanding Dues</CardTitle>
              <Building2 className="h-8 w-8 text-black" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{formatCurrency(reportData.totalDues)}</div>
              <p className="text-xs text-gray-700">
                Compare with last month
              </p>
              <div className="flex items-center mt-2">
                <span className="inline-flex items-center rounded-full bg-black/10 px-2 py-1 text-xs font-medium text-black">
                  +30
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Total Paid */}
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Collected</CardTitle>
              <TrendingUp className="h-8 w-8 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(reportData.totalPaid)}</div>
              <p className="text-xs text-purple-100">
                Compare with last month
              </p>
              <div className="flex items-center mt-2">
                <span className="inline-flex items-center rounded-full bg-white/20 px-2 py-1 text-xs font-medium text-white">
                  +80
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Section - Pie Chart */}
        <div className="lg:col-span-1">
          <Card className="flex flex-col h-full">
            <CardHeader className="items-center pb-0">
              <CardTitle>Financial Overview</CardTitle>
              <CardDescription>Income, dues, and collected amounts</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartPieDonutText data={{
                totalIncome: reportData.totalIncome,
                totalDues: reportData.totalDues,
                totalPaid: reportData.totalPaid
              }} />
            </CardContent>
            <CardContent className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 leading-none font-medium">
                Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
              </div>
              <div className="text-muted-foreground leading-none">
                Showing financial breakdown for current period
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Reports Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications by Type */}
        <Card className="bg-gradient-to-br from-orange-300 to-pink-500 text-white border-0">
          <CardHeader>
            <CardTitle className="text-white">Applications by License Type</CardTitle>
            <CardDescription className="text-orange-100">Distribution of applications by vehicle type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.applicationsByType.map((type, index) => (
                <div key={type.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full bg-white/80`}></div>
                    <span className="text-sm font-medium text-white">{type.type}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{formatNumber(type.count)}</div>
                    <div className="text-xs text-orange-100">{formatCurrency(type.amount)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods Breakdown */}
        <Card className="bg-gradient-to-br from-cyan-300 to-purple-500 text-white border-0">
          <CardHeader>
            <CardTitle className="text-white">Payment Methods Breakdown</CardTitle>
            <CardDescription className="text-cyan-100">Revenue distribution by payment method</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.paymentMethods.map((method, index) => {
                const percentage = ((method.amount / totalAmount) * 100).toFixed(1)
                return (
                  <div key={method.method} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full bg-white/80`}></div>
                      <span className="text-sm font-medium text-white">{method.method}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">{formatCurrency(method.amount)}</div>
                      <div className="text-xs text-cyan-100">{percentage}%</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage