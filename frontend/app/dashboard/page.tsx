'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MousePointer, 
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Clock
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

// Mock data - replace with API calls
const mockKPIData = {
  sessions: { value: 12450, change: 12.5, trend: 'up' },
  engagedSessions: { value: 8920, change: 8.3, trend: 'up' },
  conversions: { value: 342, change: -2.1, trend: 'down' },
  engagementTime: { value: '2m 34s', change: 15.7, trend: 'up' }
}

const mockChartData = [
  { date: 'Mon', sessions: 1200, conversions: 35 },
  { date: 'Tue', sessions: 1350, conversions: 42 },
  { date: 'Wed', sessions: 1100, conversions: 28 },
  { date: 'Thu', sessions: 1400, conversions: 45 },
  { date: 'Fri', sessions: 1250, conversions: 38 },
  { date: 'Sat', sessions: 950, conversions: 25 },
  { date: 'Sun', sessions: 800, conversions: 20 }
]

const mockInsights = [
  {
    id: 1,
    type: 'success',
    title: 'Mobile sessions increased 25%',
    description: 'Mobile traffic saw significant growth this week, likely due to recent mobile optimization.',
    action: 'Review mobile landing page performance',
    priority: 'high'
  },
  {
    id: 2,
    type: 'warning',
    title: 'Organic search CTR dropped 8%',
    description: 'Click-through rate from organic search decreased, potentially affecting conversions.',
    action: 'Review meta descriptions and titles',
    priority: 'medium'
  },
  {
    id: 3,
    type: 'info',
    title: 'New keyword opportunity detected',
    description: 'High-volume keyword "digital marketing tools" shows potential for content creation.',
    action: 'Create content targeting this keyword',
    priority: 'low'
  }
]

export default function DashboardPage() {
  const [selectedDateRange, setSelectedDateRange] = useState('7d')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // TODO: Fetch dashboard data based on selected date range
    console.log('Fetching data for date range:', selectedDateRange)
  }, [selectedDateRange])

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <TrendingUp className="h-5 w-5 text-success-600" />
      case 'warning':
        return <Target className="h-5 w-5 text-warning-600" />
      case 'critical':
        return <ArrowDownRight className="h-5 w-5 text-danger-600" />
      default:
        return <Eye className="h-5 w-5 text-primary-600" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-success-500 bg-success-50'
      case 'warning':
        return 'border-l-warning-500 bg-warning-50'
      case 'critical':
        return 'border-l-danger-500 bg-danger-50'
      default:
        return 'border-l-primary-500 bg-primary-50'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Performance overview and insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button className="btn-primary">
                <Calendar className="h-4 w-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{mockKPIData.sessions.value.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-primary-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {mockKPIData.sessions.trend === 'up' ? (
                <ArrowUpRight className="h-4 w-4 text-success-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-danger-600 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                mockKPIData.sessions.trend === 'up' ? 'text-success-600' : 'text-danger-600'
              }`}>
                {mockKPIData.sessions.change}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last period</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Engaged Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{mockKPIData.engagedSessions.value.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-success-100 rounded-lg">
                <Users className="h-6 w-6 text-success-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {mockKPIData.engagedSessions.trend === 'up' ? (
                <ArrowUpRight className="h-4 w-4 text-success-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-danger-600 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                mockKPIData.engagedSessions.trend === 'up' ? 'text-success-600' : 'text-danger-600'
              }`}>
                {mockKPIData.engagedSessions.change}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last period</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversions</p>
                <p className="text-2xl font-bold text-gray-900">{mockKPIData.conversions.value}</p>
              </div>
              <div className="p-2 bg-warning-100 rounded-lg">
                <Target className="h-6 w-6 text-warning-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {mockKPIData.conversions.trend === 'up' ? (
                <ArrowUpRight className="h-4 w-4 text-success-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-danger-600 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                mockKPIData.conversions.trend === 'up' ? 'text-success-600' : 'text-danger-600'
              }`}>
                {mockKPIData.conversions.change}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last period</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Engagement</p>
                <p className="text-2xl font-bold text-gray-900">{mockKPIData.engagementTime.value}</p>
              </div>
              <div className="p-2 bg-danger-100 rounded-lg">
                <Clock className="h-6 w-6 text-danger-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {mockKPIData.engagementTime.trend === 'up' ? (
                <ArrowUpRight className="h-4 w-4 text-success-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-danger-600 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                mockKPIData.engagementTime.trend === 'up' ? 'text-success-600' : 'text-danger-600'
              }`}>
                {mockKPIData.engagementTime.change}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last period</span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sessions & Conversions Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sessions" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { source: 'Organic', sessions: 4500 },
                { source: 'Direct', sessions: 3200 },
                { source: 'Social', sessions: 2800 },
                { source: 'Referral', sessions: 1950 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sessions" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insights Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Today's Insights</h3>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All Insights
            </button>
          </div>
          
          <div className="space-y-4">
            {mockInsights.map((insight) => (
              <div key={insight.id} className={`insight-card ${getInsightColor(insight.type)}`}>
                <div className="flex items-start space-x-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{insight.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-gray-500">Suggested action: {insight.action}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                          insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {insight.priority} priority
                        </span>
                        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                          Take Action
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
