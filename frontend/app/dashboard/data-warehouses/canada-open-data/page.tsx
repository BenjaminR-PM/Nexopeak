'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  RefreshCw, 
  Download, 
  Calendar,
  TrendingUp,
  Users,
  Globe,
  BarChart3,
  AlertCircle,
  Loader2,
  ExternalLink,
  Activity,
  Home,
  ShoppingCart
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Cell, Pie } from 'recharts'
import { 
  fetchAllCanadaOpenData,
  getAvailableDatasets,
  type InternetUsageByAge,
  type StreamingServicesByIncome,
  type DigitalAdoptionByProvince,
  type ConnectionType,
  type MonthlyTrend
} from '@/lib/canada-open-data'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4']

interface DatasetInfo {
  id: string
  title: string
  description: string
  lastUpdated: string
  recordCount: string
  apiEndpoint: string
  downloadUrl: string
}

export default function CanadaOpenDataDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDataset, setSelectedDataset] = useState('all')
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months')
  const [lastUpdated, setLastUpdated] = useState<string>('')
  
  // Real data state
  const [internetUsageByAge, setInternetUsageByAge] = useState<InternetUsageByAge[]>([])
  const [streamingServicesByIncome, setStreamingServicesByIncome] = useState<StreamingServicesByIncome[]>([])
  const [digitalAdoptionByProvince, setDigitalAdoptionByProvince] = useState<DigitalAdoptionByProvince[]>([])
  const [connectionTypes, setConnectionTypes] = useState<ConnectionType[]>([])
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([])
  const [availableDatasets, setAvailableDatasets] = useState<DatasetInfo[]>([])

  // Load real data on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await fetchAllCanadaOpenData()
      const datasets = await getAvailableDatasets()
      
      setInternetUsageByAge(data.internetUsageByAge)
      setStreamingServicesByIncome(data.streamingServicesByIncome)
      setDigitalAdoptionByProvince(data.digitalAdoptionByProvince)
      setConnectionTypes(data.connectionTypes)
      setMonthlyTrends(data.monthlyTrends)
      setAvailableDatasets(datasets)
      setLastUpdated(data.lastUpdated)
      
    } catch (err) {
      console.error('Error loading Canada Open Data:', err)
      setError('Failed to load data from Canada Open Data API. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    await loadData()
  }

  const handleExportData = () => {
    const data = JSON.stringify({
      internetUsageByAge,
      streamingServicesByIncome,
      digitalAdoptionByProvince,
      connectionTypes,
      monthlyTrends,
      lastUpdated,
      exportedAt: new Date().toISOString()
    }, null, 2)
    
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `canada-open-data-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading Canada Open Data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Data Loading Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard/data-warehouses"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Data Warehouses
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>
            <button
              onClick={handleExportData}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </button>
          </div>
        </div>
        
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Canada Open Data - Digital Analytics</h1>
          <p className="text-gray-600">
            Real-time insights from Statistics Canada on internet usage, digital adoption, and technology trends across Canada.
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="dataset-select" className="block text-sm font-medium text-gray-700 mb-2">Dataset</label>
            <select
              id="dataset-select"
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Datasets</option>
              <option value="internet-usage">Internet Usage</option>
              <option value="digital-services">Digital Services</option>
              <option value="regional-data">Regional Data</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="timeframe-select" className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
            <select
              id="timeframe-select"
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
              <option value="2years">Last 2 Years</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Activity className="h-4 w-4" />
              <span>Live Data from Statistics Canada</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Internet Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {internetUsageByAge.length > 0 
                  ? `${internetUsageByAge.reduce((sum, item) => sum + item.percentage, 0) / internetUsageByAge.length}%`
                  : 'Loading...'
                }
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Average across all age groups</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Streaming Adoption</p>
              <p className="text-2xl font-bold text-gray-900">
                {streamingServicesByIncome.length > 0 
                  ? `${Math.round(streamingServicesByIncome.reduce((sum, item) => sum + item.netflix, 0) / streamingServicesByIncome.length)}%`
                  : 'Loading...'
                }
              </p>
            </div>
            <Activity className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Netflix usage across income groups</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">E-commerce Usage</p>
              <p className="text-2xl font-bold text-gray-900">
                {digitalAdoptionByProvince.length > 0 
                  ? `${Math.round(digitalAdoptionByProvince.reduce((sum, item) => sum + item.eCommerce, 0) / digitalAdoptionByProvince.length)}%`
                  : 'Loading...'
                }
              </p>
            </div>
            <ShoppingCart className="h-8 w-8 text-orange-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Average across provinces</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Broadband Access</p>
              <p className="text-2xl font-bold text-gray-900">
                {connectionTypes.length > 0 
                  ? `${connectionTypes.find(c => c.name === 'High-speed broadband')?.value || 0}%`
                  : 'Loading...'
                }
              </p>
            </div>
            <Globe className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Households with high-speed access</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Internet Usage by Age */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600" />
            Internet Usage by Age Group
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={internetUsageByAge}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ageGroup" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}%`, 'Usage Rate']} />
              <Bar dataKey="percentage" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Streaming Services by Income */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-green-600" />
            Streaming Services by Income
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={streamingServicesByIncome}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="incomeRange" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="netflix" fill="#E50914" name="Netflix" />
              <Bar dataKey="youtube" fill="#FF0000" name="YouTube" />
              <Bar dataKey="amazonPrime" fill="#00A8E1" name="Amazon Prime" />
              <Bar dataKey="disney" fill="#113CCF" name="Disney+" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Digital Adoption by Province */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Globe className="h-5 w-5 mr-2 text-purple-600" />
            Digital Adoption by Province
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={digitalAdoptionByProvince}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="province" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="internetUsers" fill="#3B82F6" name="Internet Users" />
              <Bar dataKey="onlineBanking" fill="#10B981" name="Online Banking" />
              <Bar dataKey="eCommerce" fill="#F59E0B" name="E-Commerce" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Connection Types */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-orange-600" />
            Internet Connection Types
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={connectionTypes}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {connectionTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
          Monthly Usage Trends
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={monthlyTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="internetUsers" stroke="#3B82F6" name="Internet Users (M)" />
            <Line type="monotone" dataKey="streamingUsers" stroke="#10B981" name="Streaming Users (M)" />
            <Line type="monotone" dataKey="onlineShoppers" stroke="#F59E0B" name="Online Shoppers (M)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Available Datasets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-gray-600" />
          Available Datasets
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableDatasets.map((dataset) => (
            <div key={dataset.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-gray-900 mb-2">{dataset.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{dataset.description}</p>
              <div className="space-y-1 text-xs text-gray-500">
                <p>Last updated: {dataset.lastUpdated}</p>
                <p>Records: {dataset.recordCount}</p>
                <p>Source: {dataset.apiEndpoint}</p>
              </div>
              <a
                href={dataset.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center mt-3 text-blue-600 hover:text-blue-800 text-sm"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View on Statistics Canada
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}